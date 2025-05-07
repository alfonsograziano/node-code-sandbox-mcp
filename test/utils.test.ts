import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import {
  isRunningInDocker,
  isDockerRunning,
  preprocessDependencies,
} from '../src/utils.ts';
import * as childProcess from 'node:child_process';

vi.mock('fs');
vi.mock('node:child_process');

describe('utils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isRunningInDocker', () => {
    it('should return true when /.dockerenv exists', () => {
      vi.spyOn(fs, 'existsSync').mockImplementation((path) => {
        return path === '/.dockerenv';
      });

      expect(isRunningInDocker()).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith('/.dockerenv');
    });

    it('should return true when /proc/1/cgroup exists and contains docker', () => {
      vi.spyOn(fs, 'existsSync').mockImplementation((path) => {
        return path === '/proc/1/cgroup';
      });

      vi.spyOn(fs, 'readFileSync').mockReturnValue(
        Buffer.from('12:memory:/docker/somecontainerid')
      );

      expect(isRunningInDocker()).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith('/.dockerenv');
      expect(fs.existsSync).toHaveBeenCalledWith('/proc/1/cgroup');
      expect(fs.readFileSync).toHaveBeenCalledWith('/proc/1/cgroup', 'utf8');
    });

    it('should return true when /proc/1/cgroup exists and contains kubepods', () => {
      vi.spyOn(fs, 'existsSync').mockImplementation((path) => {
        return path === '/proc/1/cgroup';
      });

      vi.spyOn(fs, 'readFileSync').mockReturnValue(
        Buffer.from('12:memory:/kubepods/somecontainerid')
      );

      expect(isRunningInDocker()).toBe(true);
    });

    it('should return true when docker environment variables are set', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const originalEnv = process.env;
      process.env = { ...originalEnv, DOCKER_CONTAINER: 'true' };

      expect(isRunningInDocker()).toBe(true);

      process.env = originalEnv;
    });

    it('should handle file system errors gracefully', () => {
      vi.spyOn(fs, 'existsSync').mockImplementation((path) => {
        return path === '/proc/1/cgroup';
      });

      vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(isRunningInDocker()).toBe(false);
    });

    it('should return false when no docker indicators are present', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);

      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.DOCKER_CONTAINER;
      delete process.env.DOCKER_ENV;

      expect(isRunningInDocker()).toBe(false);

      process.env = originalEnv;
    });
  });

  describe('isDockerRunning', () => {
    it('should return true when docker info command succeeds', () => {
      vi.spyOn(childProcess, 'execSync').mockImplementation(() =>
        Buffer.from('')
      );

      expect(isDockerRunning()).toBe(true);
      expect(childProcess.execSync).toHaveBeenCalledWith('docker info');
    });

    it('should return false when docker info command fails', () => {
      vi.spyOn(childProcess, 'execSync').mockImplementation(() => {
        throw new Error('docker daemon not running');
      });

      expect(isDockerRunning()).toBe(false);
      expect(childProcess.execSync).toHaveBeenCalledWith('docker info');
    });
  });

  describe('preprocessDependencies', () => {
    it('should convert dependency array to record format', () => {
      const dependencies = [
        { name: 'lodash', version: '4.17.21' },
        { name: 'express', version: '4.18.2' },
      ];

      const result = preprocessDependencies({ dependencies });

      expect(result).toEqual({
        lodash: '4.17.21',
        express: '4.18.2',
      });
    });

    it('should add chartjs-node-canvas for chartjs image', () => {
      const dependencies = [{ name: 'lodash', version: '4.17.21' }];

      const result = preprocessDependencies({
        dependencies,
        image: 'alfonsograziano/node-chartjs-canvas:latest',
      });

      expect(result).toEqual({
        lodash: '4.17.21',
        'chartjs-node-canvas': '4.0.0',
        '@mermaid-js/mermaid-cli': '^11.4.2',
      });
    });

    it('should not add chartjs-node-canvas for non-chartjs images', () => {
      const dependencies = [{ name: 'lodash', version: '4.17.21' }];

      const result = preprocessDependencies({
        dependencies,
        image: 'node:lts-slim',
      });

      expect(result).toEqual({
        lodash: '4.17.21',
      });
    });
  });
});
