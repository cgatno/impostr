import fs from 'fs';
import glob from 'glob';
import path from 'path';

import TrackedFile from './TrackedFile';

export default class TrackingCache {
  constructor(cacheLibraryPath) {
    // Default config
    this.prettifyJson = true;
    // Whether we're loading or creating new, cachePath will be the permanent path for this instance
    try {
      this.path = path.normalize(cacheLibraryPath);
    } catch (pathErr) {
      throw pathErr;
    }

    // Try to load an existing cache library, or create a new one if we can't
    try {
      this.library = JSON.parse(fs.readFileSync(this.path, 'utf8'));
    } catch (readErr) {
      this.library = [];
    }
  }

  persist() {
    fs.writeFile(this.path,
      JSON.stringify(this.library, null, (this.prettifyJson ? 2 : 0)),
      'utf8',
      (err) => {
        if (err) throw err;
      },
    );
  }

  containsPath(testPath) {
    return !!this.library.find(file =>
      file.path === TrackedFile.formatAnyPath(testPath),
    );
  }

  trackPaths(globPattern, done) {
    glob(globPattern, (err, files) => {
      if (err) throw err;

      files.forEach((filePath) => {
        if (!this.containsPath(filePath)) {
          this.library.push(new TrackedFile(filePath));
        }
      });
      done(this.library);
    });
  }

  removePath(pathToRemove) {
    this.library = this.library.filter(file =>
      file.path !== TrackedFile.formatAnyPath(pathToRemove),
    );
  }

}
