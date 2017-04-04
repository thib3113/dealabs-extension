module.exports = function (grunt) {
    grunt.initConfig({
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    
    grunt.registerTask('default',
        [
            "copy:chrome",
            "compress:chrome",
            "copy:firefox",
            "compress:firefox"
        ]);
    grunt.registerTask('firefox',
        [
            "copy:firefox",
            "compress:firefox"
        ]
    );
    grunt.registerTask('chrome',
        [
            'copy:chrome',
            'compress:chrome'
        ]
    );
};