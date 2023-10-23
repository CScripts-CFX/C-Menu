fx_version 'adamant'
game "rdr3"
rdr3_warning 'I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships.'
lua54 'yes'

client_scripts {'client/*.lua'}

files {
    'html/index.html',
    'html/script/*.js',
    'html/style/*.css',
    'html/assets/images/*.png',
    'html/assets/fonts/*.ttf',
}

ui_page 'html/index.html'