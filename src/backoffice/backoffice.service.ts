import { BadRequestException, Injectable } from '@nestjs/common';
import { OwnerType } from '@prisma/client';
import * as Docker from 'dockerode';
import { findFreePorts } from 'find-free-ports';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStudentEnvironmentDto } from './dto/create-student-environment';
import { InitializeClassDto } from './dto/initialize-class.dto';

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

  private host = process.env.ENV_HOST;

  private defaultMemoryLimit = 2;
  private commonEnv = ['PUID=1000', 'PGID=1000', 'TZ=Asia/Seoul'];
  private dockerImage = 'lscr.io/linuxserver/code-server:latest';

  constructor(private prisma: PrismaService) {
    this.docker = new Docker();
  }

  /** Instructor Call this api to initialize class environment */
  async initializeClass(dto: InitializeClassDto) {
    const { classId, instructorId, memory } = dto;

    const findClass = await this.prisma.class.findUnique({
      where: {
        classId,
        instructorId,
      },
    });

    if (findClass) {
      throw new BadRequestException('CLASS_ALREADY_INITIALZED');
    }

    const salt = this.generateSalt(instructorId, classId);
    const shareVolumeName = this.shareVolumeName(salt);

    let memoryLimit = memory || this.defaultMemoryLimit;

    /** Memory Limit range check */
    if (!(memoryLimit && (memoryLimit < 0.5 || memoryLimit > 4))) {
      memoryLimit = this.defaultMemoryLimit;
    }

    /** Allocate free port */
    const [freePort] = await findFreePorts(1);

    /** Share Volume */
    await this.docker.createVolume({
      Name: shareVolumeName,
      Driver: 'local',
    });

    /** Instructor Volume */
    const instructorVolumeName = `${classId}_instructor`;
    await this.docker.createVolume({
      Name: instructorVolumeName,
      Driver: 'local',
    });

    const instructorContainer = await this.docker.createContainer({
      Image: this.dockerImage,
      name: `${this.generateSalt(instructorId, classId)}_instructor`,
      Env: [...this.commonEnv, 'SUDO_PASSWORD=password'],
      HostConfig: {
        Memory: this.GigaByteToByte(memoryLimit),
        PortBindings: {
          '8443/tcp': [
            {
              HostPort: `${freePort}`,
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

    /** Extract instructor container's ID */
    const containerId = instructorContainer.id;

    const host = `${this.host}:${freePort}`;

    await this.prisma.class.create({
      data: {
        id: classId,
        classId,
        instructorId,
        memoryLimit,
        shareVolumeName,
        envrionments: {
          create: {
            ownerId: instructorId,
            containerId: instructorContainer.id,
            endpoint: host,
            ownerType: OwnerType.INSTRUCTOR,
          },
        },
      },
    });

    return {
      host,
      containerId,
    };
  }

  async createStudentEnvironment(dto: CreateStudentEnvironmentDto) {
    const { classId, studentId } = dto;

    const findClass = await this.prisma.class.findUnique({
      where: {
        classId,
      },
    });

    if (!findClass) {
      throw new BadRequestException('CLASS_YET_INITIALIZED');
    }

    const salt = this.generateSalt(studentId, classId);
    const shareVolumeName = findClass.shareVolumeName;
    const memoryLimit = findClass.memoryLimit;

    /** Free port */
    const [freePort] = await findFreePorts(1);

    /** Student Volume */
    const studentVolume = `${salt}_volume`;
    await this.docker.createVolume({
      Name: studentVolume,
      Driver: 'local',
    });

    const studentContainer = await this.docker.createContainer({
      Image: this.dockerImage,
      name: salt,
      Env: [...this.commonEnv, 'PASSWORD=password'],
      HostConfig: {
        Memory: this.GigaByteToByte(memoryLimit),
        PortBindings: {
          '8443/tcp': [
            {
              HostPort: `${freePort}`,
            },
          ],
        },
        Mounts: [
          {
            Target: '/config/workspace',
            Source: studentVolume,
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
    await studentContainer.start();
    const host = `${this.host}:${freePort}`;
    const containerId = studentContainer.id;
    await this.prisma.environment.create({
      data: {
        ownerId: studentId,
        containerId,
        endpoint: host,
        ownerType: 'STUDENT',
        classId,
      },
    });
    return {
      host,
      containerId,
    };
  }

  private GigaByteToByte(gb: number) {
    return gb * 1024 * 1024 * 1024;
  }

  private generateSalt(instructorId: number, classId: number) {
    return `${instructorId}_${classId}`;
  }

  private shareVolumeName(salt: string) {
    return `${salt}_share`;
  }
}
