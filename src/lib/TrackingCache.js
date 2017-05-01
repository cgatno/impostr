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
      this.library = { };
    }
  }

  persist() {
    fs.writeFile(this.path,
      // Only prettify JSON with indents if the setting is enabled
      JSON.stringify(this.library, null, (this.prettifyJson ? 2 : 0)),
      'utf8',
      (err) => {
        if (err) throw err;
      },
    );
  }

  isTrackingPath(testPath) {
    // Force boolean coercion to avoid conditional gotchas
    return !!Object.keys(this.library).find(fileKey =>
      fileKey === TrackedFile.formatAnyPath(testPath), // always format paths to tracked format
    );
  }

  trackFiles(globPattern, done) {
    glob(globPattern, (err, files) => {
      if (err) throw err;

      files.forEach((filePath) => {
        this.addFile(new TrackedFile(filePath));
      });
      done(this.library);
    });
  }

  removeFile(pathToRemove) {
    if (this.library[pathToRemove]) {
      delete this.library[pathToRemove];
    }
  }

  pruneLibrary() {
    Object.keys(this.library).forEach((filePathKey) => {
      if (!fs.existsSync(filePathKey)) {
        delete this.library[filePathKey];
      }
    });
  }

  addFile(file) {
    if (!this.isTrackingPath(file.path)) {
      this.library[file.path] = file.hash;
    }
  }

}
