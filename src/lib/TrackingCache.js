import fs from 'fs';
import glob from 'glob';
import path from 'path';
import revHash from 'rev-hash';

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

  addFile(file) {
    if (!this.isTrackingPath(file.path)) {
      this.library[file.path] = file.hash;
    }
  }

  pruneLibrary() {
    Object.keys(this.library).forEach((filePathKey) => {
      if (!fs.existsSync(filePathKey)) {
        delete this.library[filePathKey];
      }
    });
  }

  updateLibrary() {
    // First prune the library so we only compare existing files
    this.pruneLibrary();

    // Generate an array containing paths to updated files
    const updatedPaths = Object.keys(this.library).filter((filePath) => {
      // Compare the saved hash to the hash of a new file
      const currentHash = revHash(fs.readFileSync(filePath));
      const savedHash = this.library[filePath];
      if (currentHash !== savedHash) {
        // If the file has changed, update the saved hash AND add this path to the list of changed
        // files
        this.library[filePath] = currentHash;
        return true;
      }
      // Otherwise, don't do anything except continue the loop
      return false;
    });

    return updatedPaths;
  }

}
