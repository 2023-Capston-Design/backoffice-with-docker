import { BadRequestException, Injectable } from '@nestjs/common';
import * as Docker from 'dockerode';
import { CreateEnvironmentDto } from './dto/create-environment';
import { InitEnvrionmentResponse } from './response/init-environment.response';
import { findFreePorts } from 'find-free-ports';

@Injectable()
export class BackofficeService {
  /** Local docker socket
   *
   * Local environment require docker socket or service to connects
   *
   * If you want to use non-local dirver, set docker socket
   *
   */
  private docker: Docker;

  private defaultMemoryLimit = 2;
  constructor() {
    this.docker = new Docker();
  }

  async createEnvironments(dto: CreateEnvironmentDto) {
    const { instructorId, classId, studentCount, memoryLimit } = dto;
    const salt = this.generateSalt(instructorId, classId);
    const shareVolumeName = `${salt}_share`;

    if (studentCount <= 0) {
      throw new BadRequestException('Student Count should be upper than 1');
    }

    let filteredMemoryLimit = memoryLimit || this.defaultMemoryLimit;
    if (!(memoryLimit && (memoryLimit < 0.5 || memoryLimit > 4))) {
      filteredMemoryLimit = this.defaultMemoryLimit;
    }

    /** Allocatable ports */
    const freePortList = await findFreePorts(studentCount + 1);

    const result: InitEnvrionmentResponse = {
      instructorEnv: {
        containerId: '',
        port: 0,
      },
      studentEnv: [],
    };

    /** Generate Share Volume */
    await this.docker.createVolume({
      Name: shareVolumeName,
      Driver: 'local',
    });

    // Common Env
    const commonEnv = ['PUID=1000', 'PGID=1000', 'TZ=Asia/Seoul'];

    /** Generate Instructor's envrironment  */
    const instructorPort = freePortList[0];
    const instructorVolumeName = `${classId}_instructor`;
    await this.docker.createVolume({
      Name: instructorVolumeName,
      Driver: 'local',
    });
    const instructorContainer = await this.docker.createContainer({
      Image: 'lscr.io/linuxserver/code-server:latest',
      name: `${this.generateSalt(instructorId, classId)}_instructor`,
      Env: [...commonEnv, 'SUDO_PASSWORD=password'],
      HostConfig: {
        Memory: this.GigaByteToByte(filteredMemoryLimit),
        PortBindings: {
          '8443/tcp': [
            {
              HostPort: `${instructorPort}`,
            },
          ],
        },
        Mounts: [
          {
            Target: '/config/workspace',
            Source: instructorVolumeName,
            Type: 'volume',
          },
          {
            Target: '/config/workspace/share',
            Source: shareVolumeName,
            Type: 'volume',
          },
        ],
      },
    });
    await instructorContainer.start();
    await instructorContainer.exec({
      Cmd: [
        '/bin/bash',
        'sudo',
        'chown',
        '-R ',
        'abc',
        '/config/workspace/share',
      ],
    }); // Set volume permission to instructor
    result.instructorEnv.port = instructorPort;
    result.instructorEnv.containerId = instructorContainer.id;

    for (let i = 1; i < studentCount + 1; i++) {
      const port = freePortList[i];
      const containerName = `${this.generateSalt(instructorId, classId)}_${i}`;
      const volumeName = `${containerName}_volume`;
      await this.docker.createVolume({
        Name: volumeName,
        Driver: 'local',
      });
      const newContainer = await this.docker.createContainer({
        Image: 'lscr.io/linuxserver/code-server:latest',
        name: containerName,
        Env: [...commonEnv, 'PASSWORD=password'],
        HostConfig: {
          Memory: this.GigaByteToByte(filteredMemoryLimit),
          PortBindings: {
            '8443/tcp': [
              {
                HostPort: `${port}`,
              },
            ],
          },
          Mounts: [
            {
              Target: '/config/workspace',
              Source: volumeName,
              Type: 'volume',
            },
            {
              Target: '/config/workspace/share',
              Source: shareVolumeName,
              Type: 'volume',
              ReadOnly: true,
            },
          ],
        },
      });
      newContainer.start();
      result.studentEnv.push({
        containerId: newContainer.id,
        port,
      });
    }

    return result;
  }

  private GigaByteToByte(gb: number) {
    return gb * 1024 * 1024 * 1024;
  }

  private generateSalt(instructorId: string, classId: string) {
    return `${instructorId}_${classId}`;
  }
}
