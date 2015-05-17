var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel'),
    ignore = require('gulp-ignore'),
    concat = require('gulp-concat');

//var flymakeFiles = "src/**/*flymake.js";
//var emacsFiles = "src/**/.#*";

gulp.task("default", function () {
  return gulp.src("src/**/*.js")
//         .pipe(ignore(flymakeFiles))
//         .pile(ignore(emacsFiles))
         .pipe(plumber())
         .pipe(sourcemaps.init())
  //    .pipe(concat("all.js"))
         .pipe(babel())
         .pipe(sourcemaps.write("."))
         .pipe(gulp.dest("dist"));
});

gulp.task("watch", function(){
  gulp.watch('src/**/*.js', ['default']);
});
