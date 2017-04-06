module.exports = function (grunt) {
    var versiony = require('versiony');

    function extend(target) {
        var sources = [].slice.call(arguments, 1);
        sources.forEach(function (source) {
            for (var prop in source) {
                target[prop] = source[prop];
            }
        });
        return target;
    }

    grunt.registerTask('patch', 'update patch version', function() {
        versiony
        .from('./src/manifest.json')
        .patch()
        .to("./src/manifest.json");
      grunt.log.write("update patch version").ok();
    });
    grunt.registerTask('minor', 'update minor version', function() {
        versiony
        .from('./src/manifest.json')
        .minor()
        .to("./src/manifest.json");
      grunt.log.write("update patch version").ok();
    });
    grunt.registerTask('major', 'update major version', function() {
        versiony
        .from('./src/manifest.json')
        .major()
        .to("./src/manifest.json");
      grunt.log.write("update patch version").ok();
    });


    grunt.initConfig({
        clean: ['./build/Chrome/**', './build/Firefox/**'],
        compress: {
            chrome: {
                options: {
                    archive: './build/zip/Chrome.zip',
                    mode: 'zip'
                },
                files: [{
                    expand: true,
                    cwd: './build/Chrome/',
                    src: ['**'],
                    dest: '/'
                }]
            },
            firefox: {
                options: {
                    archive: './build/zip/Firefox.zip',
                    mode: 'zip'
                },
                files: [{
                    expand: true,
                    cwd: './build/Firefox/',
                    src: ['**'],
                    dest: '/'
                }]
            }
        },
        copy:{
            chrome: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**', "!__specific/**"],
                    dest: './build/Chrome/'
                },
                {
                    expand: true,
                    cwd: 'src/__specific/Chrome/',
                    src: ["**"],
                    dest: './build/Chrome/'
                }]
            },
            firefox: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**', "!__specific/**"],
                    dest: './build/Firefox/'
                },
                {
                    expand: true,
                    cwd: 'src/__specific/Firefox/',
                    src: ["**"],
                    dest: './build/Firefox/'
                }]
            }
        },
        json_generator:{
            firefox: {
              dest: "./build/Firefox/manifest.json", // Destination file 
              options: extend(grunt.file.readJSON('./src/manifest.json'), grunt.file.readJSON('./src/__specific/Firefox/manifest.json'))
            },
            chrome: {
              dest: "./build/Chrome/manifest.json", // Destination file 
              options: extend(grunt.file.readJSON('./src/manifest.json'), grunt.file.readJSON('./src/__specific/Chrome/manifest.json'))
            }            
        }
    });

    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-json-generator');
    
    grunt.registerTask('default',
        [
            "clean",
            "copy:chrome",
            "copy:firefox",
            "json_generator:firefox",
            "json_generator:chrome"
        ]);
    grunt.registerTask('firefox',
        [
            "copy:firefox",
            "compress:firefox",
            "json_generator:firefox"
        ]
    );
    grunt.registerTask('chrome',
        [
            'copy:chrome',
            'compress:chrome',
            "json_generator:chrome"
        ]
    );
};