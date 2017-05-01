import babel from 'gulp-babel';
import eslint from 'gulp-eslint';
import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';

const SOURCE_ROOT_DIR = 'src/';
const SOURCE_JS_GLOB = `${SOURCE_ROOT_DIR}/**/*.js`;
const BUILD_ROOT_DIR = 'build/';

gulp.task('build', ['lint'], () =>
  gulp.src(SOURCE_JS_GLOB)
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['es2015-node'],
      }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(BUILD_ROOT_DIR)),
);

gulp.task('lint', () =>
  gulp.src(SOURCE_JS_GLOB)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failOnError()),
);
