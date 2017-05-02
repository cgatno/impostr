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

  /**
   * Persists the Impostr library by saving it to disk at the path specified when first calling
   * the library. If no path was originally specified, the library is saved to impostr.json in the
   * current directory.
   * @return {String} The file path to the saved Impostr JSON library.
   */
  persist() {
    fs.writeFile(this.path,
      // Only prettify JSON with indents if the setting is enabled
      JSON.stringify(this.library, null, (this.prettifyJson ? 2 : 0)),
      'utf8',
      (err) => {
        if (err) throw err;
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
    glob(globPattern, (err, files) => {
      if (err) throw err;

      files.forEach((filePath) => {
        this.addFile(new TrackedFile(filePath));
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
