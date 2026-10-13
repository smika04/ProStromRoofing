const fileinclude = require('gulp-file-include');

let gulp = require('gulp'),
    esbuild = require('gulp-esbuild'),
    sass = require('gulp-sass')(require('sass')),
    browserSync = require('browser-sync').create(),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer');


// 🧹 CLEAN
gulp.task('clean', function () {
    return del('.tmp');
});


// 🎨 SCSS
gulp.task('scss', function () {
    return gulp.src('app/scss/style.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 8 versions']
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('.tmp/css'))
        .pipe(browserSync.reload({stream:true}));
});


// 📦 CSS LIBS
gulp.task('css', function () {
    return gulp.src([
        'node_modules/normalize.css/normalize.css',
        'node_modules/slick-carousel/slick/slick.css'
    ])
        .pipe(concat('libs.min.css'))
        .pipe(gulp.dest('.tmp/css'))
        .pipe(browserSync.reload({stream:true}));
});


// 🧩 HTML INCLUDE
gulp.task('html', function () {
    return gulp.src('app/index.html')
        .pipe(fileinclude({
            prefix: '@@',
            basepath: 'app/'
        }))
        .pipe(gulp.dest('.tmp'))
        .pipe(browserSync.reload({stream:true}));
});


// ⚡ JS BUNDLE (ESBUILD)
gulp.task('script', function () {
    return gulp.src('app/js/main.js')
        .pipe(esbuild({
            bundle: true,
            outfile: 'main.js',
            format: 'iife',
            sourcemap: true,
            target: ['es2018']
        }))
        .pipe(gulp.dest('.tmp/js'))
        .pipe(browserSync.reload({stream:true}));
});

// 📦 JS LIBS
gulp.task('js', function () {
    return gulp.src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/slick-carousel/slick/slick.js'
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('.tmp/js'))
        .pipe(browserSync.reload({stream:true}));
});


// 🖼 IMAGES
gulp.task('images', function () {
    return gulp.src('app/images/**/*.*')
        .pipe(gulp.dest('.tmp/images'))
        .pipe(browserSync.reload({stream:true}));
});


// 🔤 FONTS
gulp.task('fonts', function () {
    return gulp.src('app/fonts/**/*.*')
        .pipe(gulp.dest('.tmp/fonts'));
});


// 🌐 BROWSER SYNC
gulp.task('browser-sync', function () {

    browserSync.init({
        server: {
            baseDir: '.tmp',
            index: 'index.html'
        },
        port: 3000
    });

});

// 👀 WATCH
gulp.task('watch', function () {

    gulp.watch(
        'app/scss/**/*.scss',
        { usePolling: true },
        gulp.series('scss')
    );

    gulp.watch(
        'app/**/*.html',
        { usePolling: true },
        gulp.series('html')
    );

    gulp.watch(
        'app/js/**/*.js',
        { usePolling: true },
        gulp.series('script')
    );

    gulp.watch(
        'app/images/**/*.*',
        { usePolling: true },
        gulp.series('images')
    );

    gulp.watch(
        'app/fonts/**/*.*',
        { usePolling: true },
        gulp.series('fonts')
    );

    console.log('👀 Watching app files...');
});

// 🚀 EXPORT BUILD

gulp.task('export-html', function () {
    return gulp.src([
        'app/*.html',
        '!app/components/**/*.html'
    ])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: 'app/'
        }))
        .pipe(gulp.dest('dist'));
});


gulp.task('export-css', function () {
    return gulp.src('.tmp/css/**/*')
        .pipe(gulp.dest('dist/css'));
});


gulp.task('export-js', function () {
    return gulp.src('.tmp/js/**/*')
        .pipe(gulp.dest('dist/js'));
});


gulp.task('export-images', function () {
    return gulp.src('app/images/**/*.*')
        .pipe(gulp.dest('dist/images'));
});


gulp.task('export-fonts', function () {
    return gulp.src('app/fonts/**/*.*')
        .pipe(gulp.dest('dist/fonts'));
});


gulp.task('export', gulp.parallel(
    'export-html',
    'export-css',
    'export-js',
    'export-images',
    'export-fonts'
));

// 🏗 BUILD
gulp.task('build', gulp.series(
    'clean',
    gulp.parallel(
        'html',
        'scss',
        'css',
        'js',
        'script',
        'images',
        'fonts'
    ),
    'export'
));

// 🔥 DEFAULT DEV
gulp.task('default', gulp.series(

    gulp.parallel(
        'css',
        'scss',
        'js',
        'html',
        'script',
        'images',
        'fonts'
    ),

    gulp.parallel(
        'browser-sync',
        'watch'
    )
));