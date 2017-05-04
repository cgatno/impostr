import fs from 'fs';
import glob from 'glob';
import path from 'path';
import revHash from 'rev-hash';

import TrackedFile from './TrackedFile';

export default class TrackingCache {
  constructor(cacheLibraryPath, debugInDevelopment) {
    // Default config
    this.prettifyJson = true;
    // Keep track of whether or not this instance should log debug information
    // ONLY log debugging when the user wants it (by default) and the NODE_ENV is set to development
    this.debug = (debugInDevelopment && (process.env.NODE_ENV === 'development'));
    // Whether we're loading or creating new, cachePath will be the permanent path for this instance
    try {
      this.path = path.normalize(cacheLibraryPath);
    } catch (pathErr) {
      if (this.debug) console.log('IMPOSTR ERROR: ', JSON.stringify(pathErr));
      throw pathErr;
    }

    // Try to load an existing cache library, or create a new one if we can't
    try {
      this.library = JSON.parse(fs.readFileSync(this.path, 'utf8'));
      if (this.debug) console.log(`Loaded Impostr library from ${this.path}.`);
    } catch (readErr) {
      this.library = { };
      if (this.debug) console.log(`Created new Impostr library at ${this.path}.`);
    }
  }

  /**
   * Persists the Impostr library by saving it to disk at the path specified when first calling
   * the library. If no path was originally specified, the library is saved to impostr.json in the
   * current directory.
   * @return {String} The file path to the saved Impostr JSON library.
   */
  persist() {
    if (this.debug) console.log(`Writing cache to ${this.path}...`);
    fs.writeFile(this.path,
      // Only prettify JSON with indents if the setting is enabled
      JSON.stringify(this.library, null, (this.prettifyJson ? 2 : 0)),
      'utf8',
      (err) => {
        if (err) {
          if (this.debug) console.error('IMPOSTR ERROR: ', JSON.stringify(err));
          throw err;
        }
      },
    );
    return this.path;
  }

  /**
   * Checks the tracking library for a specific file path.
   * @param  {String}  testPath A valid file path that will be tested against the library.
   * @return {Boolean}          Returns true if the file path is already being tracked, false if
   * not.
   */
  isTrackingPath(testPath) {
    // Force boolean coercion to avoid conditional gotchas
    return !!Object.keys(this.library).find(fileKey =>
      fileKey === TrackedFile.formatAnyPath(testPath), // always format paths to tracked format
    );
  }

  /**
   * Begins tracking any files that match the provided glob pattern and calls the 'done' function
   * when complete. If there are files matching the glob pattern that are already being tracked,
   * they won't be added to the library.
   * @param  {String}   globPattern A shell-like file search pattern that matches files you want to
   * track. See https://github.com/isaacs/node-glob for more.
   * @param  {Function} done        A function to be called when all newly added files are tracked.
   */
  trackFiles(globPattern, done) {
    if (this.debug) console.log(`Tracking files matching pattern ${globPattern}`);
    glob(globPattern, (err, files) => {
      if (err) {
        if (this.debug) console.log('IMPOSTR ERROR: ', JSON.stringify(err));
        throw err;
      }

      // Only show tracking progress if debugging is enabled
      let numFiles;
      let currentFile;
      if (this.debug) {
        numFiles = files.length;
        currentFile = 0;
      }

      files.forEach((filePath) => {
        const fileAdded = this.addFile(new TrackedFile(filePath));
        if (this.debug) {
          currentFile += 1;
          if (fileAdded) {
            console.log(`[${currentFile}/${numFiles}] Began tracking ${filePath}...`);
          } else {
            console.log(`[${currentFile}/${numFiles}] Already tracking ${filePath}.`);
          }
        }
      });
      done(this.library);
    });
  }

  /**
   * Removes a file path from the tracking library.
   * @param  {String} pathToRemove A valid file path that's currently tracked.
   * @return {String|Boolean}      Returns the file path if successfully removed, otherwise returns
   * false.
   */
  removeFile(pathToRemove) {
    if (this.library[pathToRemove]) {
      delete this.library[pathToRemove];
      return pathToRemove;
    }
    return false;
  }

  /**
   * Adds a new file to the tracking library.
   * @param {Object} file A TrackedFile object containing information about the file to add to the
   * library.
   * @return {String|Boolean} Returns a string representation of the newly added key/value pair if
   * successful, otherwise returns false.
   */
  addFile(file) {
    if (!this.isTrackingPath(file.path)) {
      this.library[file.path] = file.hash;
      return `${file.path}:${this.library[file.path]}`;
    }
    return false;
  }

  /**
   * Removes any entries in the library that point to dead files.
   * @return {Array} A collection of file path strings that were deleted from the library.
   */
  pruneLibrary() {
    const deletedPaths = [];
    Object.keys(this.library).forEach((filePathKey) => {
      if (!fs.existsSync(filePathKey)) {
        delete this.library[filePathKey];
        deletedPaths.push(filePathKey);
      }
    });
    return deletedPaths;
  }

  /**
   * Update hashes of tracked files and return an array of file paths for files that have changed
   * since last persist. Note that this calls pruneLibrary() which deletes dead file links.
   * @return {Array} A collection of file path strings for the files that have been changed since
   * the last time the library was saved (persisted).
   */
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
