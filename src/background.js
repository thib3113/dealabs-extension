try{
    var notificationsNotified = {};
    var lastUpdateRequested = {
        imgur : new Date(0),
        dealabs : new Date(0)
    };

    dbg = {
        getSettings : function(){
            try{
                console.log(JSON.stringify(settingsManager));
            }
            catch(e){
                console.error("impossible de récupérer les paramètres .");
            }
        }
    }

    function isEaster(Y) {
        var C = Math.floor(Y/100);
        var N = Y - 19*Math.floor(Y/19);
        var K = Math.floor((C - 17)/25);
        var I = C - Math.floor(C/4) - Math.floor((C - K)/3) + 19*N + 15;
        I = I - 30*Math.floor((I/30));
        I = I - Math.floor(I/28)*(1 - Math.floor(I/28)*Math.floor(29/(I + 1))*Math.floor((21 - N)/11));
        var J = Y + Math.floor(Y/4) + I + 2 - C + Math.floor(C/4);
        J = J - 7*Math.floor(J/7);
        var L = I - J;
        var M = 3 + Math.floor((L + 40)/44);
        var D = L + 28 - 31*Math.floor(M/4);

        d = new Date()
        return d.getUTCMonth()+1 == M && d.getUTCDate() == D
    }

    //🎂🎂🎂🎂🎂🎂🎂🎂
    d = new Date();
    if(d.getMonth()+1 == 4 && d.getDate() == 17){
        extension.browserAction.setIcon({path:"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBvbHlnb24gc3R5bGU9ImZpbGw6I0Y3Q0Q5NTsiIHBvaW50cz0iNzcuOTEzLDIyOC4xNzQgNzcuOTEzLDMyMi43ODMgMjc4LjI2MSwzMzkuNDc4IDI1NiwyMjguMTc0ICIvPjxwb2x5Z29uIHN0eWxlPSJmaWxsOiNGRjlBNTI7IiBwb2ludHM9IjI1NiwyMjguMTc0IDI1NiwzMzkuNDc4IDQwMC42OTYsMzIyLjc4MyA0MDAuNjk2LDIyOC4xNzQgIi8+PHBvbHlnb24gc3R5bGU9ImZpbGw6I0Y3Q0Q5NTsiIHBvaW50cz0iNzcuOTEzLDM1Ni4xNzQgNzcuOTEzLDQ1MC43ODMgMjU2LDQ1MC43ODMgMjc4LjI2MSwzMzkuNDc4ICIvPjxwb2x5Z29uIHN0eWxlPSJmaWxsOiNGRjlBNTI7IiBwb2ludHM9IjI1NiwzMzkuNDc4IDI1Niw0NTAuNzgzIDQwMC42OTYsNDUwLjc4MyA0MDAuNjk2LDM1Ni4xNzQgIi8+PHBvbHlnb24gc3R5bGU9ImZpbGw6I0I3NTU0ODsiIHBvaW50cz0iNzcuOTEzLDMyMi43ODMgNzcuOTEzLDM1Ni4xNzQgMjU2LDM1Ni4xNzQgMjY3LjEzLDMzOS40NzggMjU2LDMyMi43ODMgIi8+PGc+PHJlY3QgeD0iMjU2IiB5PSIzMjIuNzgzIiBzdHlsZT0iZmlsbDojOEU0MjM4OyIgd2lkdGg9IjE2Ni45NTciIGhlaWdodD0iMzMuMzkxIi8+PHBvbHlnb24gc3R5bGU9ImZpbGw6IzhFNDIzODsiIHBvaW50cz0iNDQuNTIyLDE4My42NTIgNDQuNTIyLDI1MC40MzUgMjU2LDI1MC40MzUgMjc4LjI2MSwyMTcuMDQzIDI1NiwxODMuNjUyICIvPjwvZz48cGF0aCBzdHlsZT0iZmlsbDojNzAwRDAwOyIgZD0iTTQxMS44MjYsMTgzLjY1MkgyNTZ2NjYuNzgzaDE0NC42OTZ2MTg5LjIxN2g2Ni43ODNWMjM5LjMwNEM0NjcuNDc4LDIwOC42OTYsNDQyLjQzNSwxODMuNjUyLDQxMS44MjYsMTgzLjY1MnoiLz48cG9seWdvbiBzdHlsZT0iZmlsbDojRjlFQkRCOyIgcG9pbnRzPSIzNi4xNzQsNDQ1LjIxNyA1OC43Niw1MTIgMjU1LjQ0Myw1MTIgMjc3LjcwNCw0NDUuMjE3ICIvPjxnPjxwb2x5Z29uIHN0eWxlPSJmaWxsOiNFOEQ2QkQ7IiBwb2ludHM9IjI1NS40NDMsNDQ1LjIxNyAyNTUuNDQzLDUxMiA0NTMuNzA0LDUxMiA0NzUuODI2LDQ0NS4yMTcgIi8+PHBvbHlnb24gc3R5bGU9ImZpbGw6I0U4RDZCRDsiIHBvaW50cz0iMCw0MjguNTIyIDAsNDYxLjkxMyAyNTUuNzIyLDQ2MS45MTMgMjY2Ljk5MSw0NDUuMjE3IDI1Niw0MjguNTIyICIvPjwvZz48cmVjdCB4PSIyNTYiIHk9IjQyOC41MjIiIHN0eWxlPSJmaWxsOiNEMkJBOUM7IiB3aWR0aD0iMjU2IiBoZWlnaHQ9IjMzLjM5MSIvPjxwYXRoIHN0eWxlPSJmaWxsOiM3MDBEMDA7IiBkPSJNMjcyLjY5NiwxNDQuNjk2aC0zMy4zOTFWOTQuNjA5QzIzOS4zMDQsNDIuNDQxLDI4MS43NDYsMCwzMzMuOTEzLDB2MzMuMzkxYy0zMy43NTUsMC02MS4yMTcsMjcuNDYyLTYxLjIxNyw2MS4yMTdWMTQ0LjY5NnoiLz48cGF0aCBzdHlsZT0iZmlsbDojRUY1MzUyOyIgZD0iTTIwNS45MTMsMTMzLjU2NWMwLDI3LjY2MiwyMi40MjQsNTAuMDg3LDUwLjA4Nyw1MC4wODdsMTEuMTMtNTAuMDg3TDI1Niw4My40NzhDMjI4LjMzOCw4My40NzgsMjA1LjkxMywxMDUuOTAzLDIwNS45MTMsMTMzLjU2NXoiLz48cGF0aCBzdHlsZT0iZmlsbDojQjc1NTQ4OyIgZD0iTTI1Niw4My40Nzh2MTAwLjE3NGMyNy42NjIsMCw1MC4wODctMjIuNDI0LDUwLjA4Ny01MC4wODdTMjgzLjY2Miw4My40NzgsMjU2LDgzLjQ3OHoiLz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48L3N2Zz4="})
    }
    //🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰
    else if(isEaster(d.getFullYear())){
        extension.browserAction.setIcon({path:"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggc3R5bGU9ImZpbGw6I0ZGREE0NDsiIGQ9Ik00MjYuMDM3LDM0MS45NjNDNDI2LjAzNyw0MzUuODcyLDM0OS45MDksNTEyLDI1Niw1MTJTODUuOTYzLDQzNS44NzIsODUuOTYzLDM0MS45NjNTMTYyLjA5MSwwLDI1NiwwUzQyNi4wMzcsMjQ4LjA1NSw0MjYuMDM3LDM0MS45NjN6Ii8+PGc+PHBhdGggc3R5bGU9ImZpbGw6I0ZGQ0QwMDsiIGQ9Ik0xNTguMDYxLDM0MS45NjNjMC04MS41NCw1Ny4zOTQtMjc5LjI4NywxMzMuOTg4LTMyOS45NjdDMjgwLjQzLDQuMzA4LDI2OC4zNywwLDI1NiwwQzE2Mi4wOTIsMCw4NS45NjMsMjQ4LjA1NSw4NS45NjMsMzQxLjk2M0M4NS45NjMsNDM1Ljg3MiwxNjIuMDkyLDUxMiwyNTYsNTEyYzEyLjM3MSwwLDI0LjQyOS0xLjMzMywzNi4wNDktMy44NDJDMjE1LjQ1OCw0OTEuNjIyLDE1OC4wNjEsNDIzLjUwMSwxNTguMDYxLDM0MS45NjN6Ii8+PHBhdGggc3R5bGU9ImZpbGw6I0ZGQ0QwMDsiIGQ9Ik04Ny41MzcsMzE1LjM2NmMtMS4wMzIsOS43ODMtMS41NzUsMTguNzM3LTEuNTc1LDI2LjU5N2MwLDUuMTM4LDAuMjQxLDEwLjIxNywwLjY4OCwxNS4yMzlsNzUuMTE0LDI4LjA2NGw5NC4yMy0zNS4yMDVsOTQuMjM1LDM1LjIwNGw3NS4xMjEtMjguMDY0YzAuNDQ2LTUuMDIxLDAuNjg4LTEwLjEsMC42ODgtMTUuMjM3YzAtNy44Ni0wLjU0Mi0xNi44MTMtMS41NzUtMjYuNTk3SDg3LjUzN1YzMTUuMzY2eiIvPjxwYXRoIHN0eWxlPSJmaWxsOiNGRkNEMDA7IiBkPSJNMTM1LjA5MSw0NjEuNDY3YzEzLjk1OCwxNC4xMTksMzAuMzQ5LDI1LjgyNSw0OC41MjQsMzQuMzg5YzIyLjMzMy01LjkyNyw0Ni45OTgtOS4wMzQsNzIuMzg0LTkuMDM0YzI1LjM4NiwwLDUwLjA1MywzLjEwOCw3Mi4zODQsOS4wMzRjMTguMTc1LTguNTY0LDM0LjU2Ny0yMC4yNyw0OC41MjQtMzQuMzg5SDEzNS4wOTF6Ii8+PC9nPjxwYXRoIHN0eWxlPSJmaWxsOiNGRkU0Nzc7IiBkPSJNNDI0LjQ2OCwzMTUuMzY2QzQxMy4xNjIsMjA4LjI1MiwzNDIuMDQ2LDAsMjU2LDBTOTguODM4LDIwOC4yNTIsODcuNTMyLDMxNS4zNjZINDI0LjQ2OHoiLz48Zz48cGF0aCBzdHlsZT0iZmlsbDojRkZEQTQ0OyIgZD0iTTI5Mi4wNDcsMTEuOTk4QzI4MC40MjksNC4zMSwyNjguMzY4LDAsMjU2LDBDMTY5Ljk1NCwwLDk4LjgzOCwyMDguMjUyLDg3LjUzMiwzMTUuMzY2aDcyLjA5OEMxNjkuMzEsMjIzLjY1MiwyMjIuODQsNTcuNzkzLDI5Mi4wNDcsMTEuOTk4eiIvPjxwYXRoIHN0eWxlPSJmaWxsOiNGRkRBNDQ7IiBkPSJNMTYxLjY1NCw4Mi4xNjljLTcuMDMyLDEyLjQ3My0xMy42OTcsMjUuODYyLTE5LjkzNiwzOS44MThsMS4xMTgsMC40NDljMzMuMTE2LDEzLjMwNCw3Mi4yNDcsMjAuMzM3LDExMy4xNjMsMjAuMzM3czgwLjA0Ni03LjAzMiwxMTMuMTYzLTIwLjMzN2wxLjExOC0wLjQ0OWMtNi4yMzktMTMuOTU3LTEyLjkwMy0yNy4zNDUtMTkuOTM2LTM5LjgxOEgxNjEuNjU0eiIvPjwvZz48Y2lyY2xlIHN0eWxlPSJmaWxsOiNGRjNGNjI7IiBjeD0iMjU2IiBjeT0iMjExLjIxNiIgcj0iNDAuMjI2Ii8+PHBhdGggc3R5bGU9ImZpbGw6I0Q4MDAyNzsiIGQ9Ik0yNTEuODIsMjExLjIxMWMwLTE1LjczNSw5LjAzOS0yOS4zNTEsMjIuMjA0LTM1Ljk2MmMtNS40MjMtMi43MjMtMTEuNTQyLTQuMjY2LTE4LjAyNC00LjI2NmMtMjIuMjE3LDAtNDAuMjI2LDE4LjAxMS00MC4yMjYsNDAuMjI5czE4LjAxLDQwLjIyOCw0MC4yMjYsNDAuMjI2YzYuNDgyLDAsMTIuNTk5LTEuNTQyLDE4LjAyMi00LjI2NkMyNjAuODU5LDI0MC41NjIsMjUxLjgyLDIyNi45NDcsMjUxLjgyLDIxMS4yMTF6Ii8+PHBhdGggc3R5bGU9ImZpbGw6I0ZGM0Y2MjsiIGQ9Ik0zNDYuODQ3LDIxMS4yMTFjMCwyMi4yMTcsMTguMDEsNDAuMjI4LDQwLjIyNiw0MC4yMjZjOS4xMDksMCwxNy41MDgtMy4wMzIsMjQuMjUyLTguMTM3Yy01LjcxOC0yMy4zODYtMTIuOTcyLTQ3Ljk5Ni0yMS41MjgtNzIuMjE2Yy0wLjkwMS0wLjA2MS0xLjgwOC0wLjEwMS0yLjcyNC0wLjEwMUMzNjQuODU2LDE3MC45ODQsMzQ2Ljg0NywxODguOTk1LDM0Ni44NDcsMjExLjIxMXoiLz48Zz48cGF0aCBzdHlsZT0iZmlsbDojRDgwMDI3OyIgZD0iTTM3OS4wODYsMjExLjIxMWMwLTEyLjIwNyw1LjQ0NC0yMy4xMzYsMTQuMDI5LTMwLjUxM2MtMS4wODQtMy4yMDktMi4xODgtNi40MTUtMy4zMTgtOS42MTNjLTAuOTAxLTAuMDYxLTEuODA4LTAuMTAxLTIuNzI0LTAuMTAxYy0yMi4yMTcsMC00MC4yMjcsMTguMDExLTQwLjIyNyw0MC4yMjhzMTguMDEsNDAuMjI4LDQwLjIyNiw0MC4yMjZjNS43MzUsMCwxMS4xODgtMS4yMDQsMTYuMTI0LTMuMzY4QzM4OS4wMDUsMjQxLjg1NiwzNzkuMDg2LDIyNy42OTYsMzc5LjA4NiwyMTEuMjExeiIvPjxwYXRoIHN0eWxlPSJmaWxsOiNEODAwMjc7IiBkPSJNMTY1LjE1MywyMTEuMjFjMC0yMi4yMTctMTguMDEtNDAuMjI2LTQwLjIyNi00MC4yMjZjLTAuOTE2LDAtMS44MjIsMC4wNDItMi43MjQsMC4xMDJjLTguNTU2LDI0LjIyLTE1LjgxLDQ4LjgzLTIxLjUyOCw3Mi4yMTdjNi43NDQsNS4xMDQsMTUuMTQzLDguMTM2LDI0LjI1Miw4LjEzNkMxNDcuMTQ0LDI1MS40MzgsMTY1LjE1MywyMzMuNDI3LDE2NS4xNTMsMjExLjIxeiIvPjwvZz48cGF0aCBzdHlsZT0iZmlsbDojMDBCNkJEOyIgZD0iTTI1Niw0MTMuNjExYy01My40ODQsMC0xMDEuNDMsMTIuODQ2LTEzMy45MDUsMzMuMTU1YzEwLjQ3NSwxMy4zNjUsMjIuOTE0LDI1LjExNSwzNi44NzIsMzQuODM0YzI3Ljg3MS05LjkxLDYxLjIwNy0xNS42NzcsOTcuMDMyLTE1LjY3N3M2OS4xNjIsNS43NjcsOTcuMDMyLDE1LjY3N2MxMy45NTktOS43MTksMjYuMzk3LTIxLjQ2NywzNi44NzItMzQuODM0QzM1Ny40Myw0MjYuNDU3LDMwOS40ODQsNDEzLjYxMSwyNTYsNDEzLjYxMXoiLz48cGF0aCBzdHlsZT0iZmlsbDojMDA5Njk4OyIgZD0iTTE3OC43MDMsNDIzLjIxOGMtMjEuNzE3LDUuNzE4LTQwLjk2MiwxMy43NjMtNTYuNjA4LDIzLjU0OGMxMC40NzUsMTMuMzY1LDIyLjkxNCwyNS4xMTUsMzYuODcyLDM0LjgzNGMxNi43ODItNS45NjcsMzUuNTU3LTEwLjQxOSw1NS42NTItMTMuMDI3QzIwMC4yMiw0NTUuNjYsMTg4LjAzMyw0NDAuMzMzLDE3OC43MDMsNDIzLjIxOHoiLz48cGF0aCBzdHlsZT0iZmlsbDojOTFDQzA0OyIgZD0iTTQyNS44OTUsMzM0LjY4OGMtMC41MDItMTMuNTc3LTIuMzQ1LTI5Ljc0My01LjM4OS00Ny41M2wtNzAuMjc4LDI2LjI1NGwtOTQuMjM0LTM1LjIwNWwtOTQuMjMsMzUuMjA1bC03MC4yNzEtMjYuMjUzYy0zLjA0NCwxNy43ODctNC44ODcsMzMuOTUzLTUuMzg5LDQ3LjUzbDc1LjY1OSwyOC4yNjhsOTQuMjMtMzUuMjA1bDk0LjIzNCwzNS4yMDVMNDI1Ljg5NSwzMzQuNjg4eiIvPjxwYXRoIHN0eWxlPSJmaWxsOiM4NUJCMDQ7IiBkPSJNODYuMTA1LDMzNS42MzJsNzMuMTM0LDI3LjMyNGMtMC43NzMtNi41NzctMS4xNzktMTMuMjY2LTEuMTc5LTIwLjA0OWMwLTguNTYyLDAuNjQxLTE4LjQxOCwxLjg2Mi0yOS4yMzhsLTY4LjQyOS0yNS41NjdDODguNDUsMzA1Ljg4OSw4Ni42MDYsMzIyLjA1NCw4Ni4xMDUsMzM1LjYzMnoiLz48cGF0aCBzdHlsZT0iZmlsbDojOUJDOUZGOyIgZD0iTTE3NS43NzcsNTkuMTczYy04Ljg4NSwxMy4xOTUtMTcuMjk3LDI4LjAyLTI1LjE0OSw0My44NzJjMjkuNDQ3LDExLjgzLDY1LjksMTguODMsMTA1LjM3MiwxOC44M3M3NS45MjUtNywxMDUuMzcyLTE4LjgzYy03Ljg1MS0xNS44NTItMTYuMjY0LTMwLjY3Ny0yNS4xNDktNDMuODcyYy0yNC4wODUsNi42NDItNTEuMzQ1LDEwLjM5LTgwLjIyMywxMC4zOVMxOTkuODYyLDY1LjgxNSwxNzUuNzc3LDU5LjE3M3oiLz48cGF0aCBzdHlsZT0iZmlsbDojNTdBNEZGOyIgZD0iTTE1MC42MjgsMTAzLjA0NGMxOC45MjcsNy42MDQsNDAuNzU5LDEzLjE5Nyw2NC40MTYsMTYuMjM1YzguMTIyLTE3LjkxNCwxNi45MzktMzQuODU3LDI2LjM0NC01MC4wNDZjLTIzLjQ2MS0xLjAzOS00NS42MzItNC41NDktNjUuNjEyLTEwLjA1OUMxNjYuODkyLDcyLjM2OCwxNTguNDgsODcuMTkzLDE1MC42MjgsMTAzLjA0NHoiLz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48L3N2Zz4="})
    }
    else{
        extension.browserAction.setIcon({path:extension.getManifest().icons});
    }



    extension.onMessage('open_tab', function(datas){
        datas = datas || {};
        datas.onLoad = function(tab){
            updateNotifications();
        };
        extension.openTab(datas);
    })

    extension.onMessage('update_settings', function(datas){
        settingsManager.syncSettings();
        extension.sendMessage('update_settings', {});
    })

    extension.onMessage('save_imgur_informations', function(datas){
        datas.expires_date = parseInt(Date.now()/1000)+parseInt(datas.expires_in);
        settingsManager.imgurAPI = datas;
        settingsManager._updateCb = function(){
            extension.sendMessage('update_settings', {});
            settingsManager._updateCb = null;
        }
    });

    extension.onMessage('remove_all', function(datas){
        remove_all();
    });


    extension.onMessage('update', function(datas, cb){
            cb = cb || function(){};
    
        try{
            if(datas.content != undefined)
                updateNotifications(datas.content, cb);
            else
                updateNotifications(null, cb);
        }
        catch(e){
            updateNotifications(null, cb);
        }
    });

    function remove_all(){
        extension.getStorage(['notifications'], function(value){
            notifications = value.notifications;
            var queue = async.queue(function(item, cb){
                setTimeout(function(){
                    $.ajax({
                        url : this.item.url,
                        complete:function(){
                            extension.getStorage('notifications_counter', function(value){
                                notifications_counter = value.notifications_counter;

                                notifications_counter[item.categorie].value -= 1;

                                nb_add = 0;
                                nb_add += notifications_counter['deals'].value;
                                nb_add += notifications_counter['alertes'].value;
                                nb_add += notifications_counter['MPs'].value;
                                nb_add += notifications_counter['forum'].value;
                                plus = notifications_counter['forum'].plus?"+":"";
                                nb_notifs = nb_add<1000? nb_add + plus :"999+";
                                extension.setStorage(
                                {
                                    notifications_counter:notifications_counter,
                                });
                                extension.browserAction.setBadgeText({text:''+nb_notifs});
                                this.cb();
                            }.bind({cb:this.cb, item:this.item}))
                        }.bind({cb:this.cb, item:this.item})
                    })
                }.bind({cb:cb, item:item}),200)
            }, 5); // Run 5 simultaneous request

            queue.drain = function() {
                updateNotifications();
            };
            for(categorie in notifications){
                curCat = notifications[categorie];
                for (var i = 0; i < curCat.length; i++) {
                    queue.push(curCat[i]);
                }
            }
        });
    }

    function iconState(state){
        switch(state){
            case "connected":
                extension.browserAction.setPopup({popup:'popup.html'});
            break;
            case "disconnected":
                //here we are not connected
                extension.browserAction.setTitle({title:extension.i18n.getMessage("you are not connected")});
                extension.browserAction.setBadgeText({text:'!'});
                extension.browserAction.setPopup({popup:''});
                extension.browserAction.setBadgeBackgroundColor({color:'#FFE400'});
                extension.setStorage({'notifications':{}});
            break;
            case "error":
                //here we have an error
                extension.browserAction.setTitle({title:extension.i18n.getMessage("Connection error")});
                extension.browserAction.setBadgeText({text:'⚠️'});
                extension.browserAction.setBadgeBackgroundColor({color:[255, 0, 0, 10]});
            break;
        }
    }

    function updateNotifications(content, cb){
        content = content || null;
        var cb = cb || function(){};

        clearTimeout(notificationUpdateTimeout);
        // if(content == null){
        var notification_list = [];
        //check connection
        $.ajax({
            url:dealabs_protocol+"www.dealabs.com",
            success:function(response){
                // response = response.replace(/src=["|']\/\//g, dealabs_protocol+'');
                $page = $(response);
                $page.find("img").each(function(){
                    var src = $(this).attr("src");
                    $(this).removeAttr("src");
                    $(this).attr("data-src", src);
                });
                if($page.find("#login_header").length>0){
                    iconState("disconnected");
                }
                else{
                    //we are connected
                    extension.removeWaitFor('disconnected');
                    extension.stopWaitFor('connected');

                    iconState("connected");

                    //profil informations
                    profil = {
                        link : $page.find('#member_parameters a:first').attr('href')
                    }
                    try{
                        profilInfos = profil.link.match(/\/([0-9]+)\/(.*)$/);
                        profil.id = profilInfos[1];
                        profil.name = profilInfos[2];
                    }
                    catch(e){
                        profil.id = null;
                        profil.name = null;
                    }

                    extension.setStorage({
                        profil:profil
                    });
                    
                    // nbNotifs = parseInt($page.find("#number_notif").text());
                    //get notifications from webpage, because servlet don't work correctly
                    notification_list = [];
                    $page.find("#notification_box .sub_menu_box_item").each(function(index,item){
                        $item = $(item);
                        id = $item.attr("id").split("_");
                        img_src = $item.find(".notification_image_content img").data("src") || "";
                        notification = {
                            id: id[1],
                            type: id[0],
                            deal_thumb_image: img_src.slice("https://static.dealabs.com/".length),
                            title: $item.find(".notification_first_text_content p:last").text(),
                            url: $item.find(".notification_first_text_content a").attr("href"),
                        };
                        notification_list.push(notification);
                    })

                    async.parallel({
                        notifications: function(callback) {
                            var index = 5;
                            var offset = 5;
                            $.ajax({
                                cb:callback,
                                notification_list:notification_list,
                                url:dealabs_protocol+"www.dealabs.com/ajax/notification-scroll",
                                data:{
                                    index:index,
                                    offset:offset
                                },
                                method:"POST",
                                dataType:"json",
                                success:function(resp){
                                    if(resp.notifications != undefined && resp.notifications.length > 0){
                                        for (var i = resp.notifications.length - 1; i >= 0; i--) {
                                            this.notification_list.push(resp.notifications[i])
                                        }

                                        this.data = {
                                            index:index ,
                                            offset:resp.offset+index
                                        }
                                        $.ajax(this);
                                    }
                                    else{
                                        this.cb(null, this.notification_list);
                                    }
                                },
                                error:function(jqXHR, textStatus, errorThrown){
                                    this.cb({
                                        "jqXHR" : jqXHR,
                                        "textStatus" : textStatus,
                                        "errorThrown" : errorThrown
                                    }, this.notification_list)
                                }
                            });
                        },
                        mps: function(callback) {
                            var index = 0;
                            $.ajax({
                                cb:callback,
                                notification_list:[],
                                url:dealabs_protocol+"www.dealabs.com/ajax/mailbox-scroll",
                                data:{
                                    index:index
                                },
                                method:"POST",
                                dataType:"json",
                                success:function(resp){
                                    if(resp.pms != undefined && resp.pms.length > 0){
                                        for (var i = resp.pms.length - 1; i >= 0; i--) {
                                            notification = resp.pms[i];
                                            notification.type = "MP";
                                            this.notification_list.push(notification)
                                            
                                            //add the user to the cache
                                            profilsCache[notification.profile_id] = {
                                                img : notification.profile_image,
                                                pseudo : notification.profile_username
                                            }

                                        }
                                        this.data = {
                                            index: ++index
                                        }
                                        $.ajax(this);
                                    }
                                    else{
                                        this.cb(null, this.notification_list);
                                    }
                                },
                                error:function(jqXHR, textStatus, errorThrown){
                                    this.cb({
                                        "jqXHR" : jqXHR,
                                        "textStatus" : textStatus,
                                        "errorThrown" : errorThrown
                                    }, this.notification_list)
                                }
                            });
                        }
                    }, 
                    function(err, results) {
                        if(err != null){
                            notificationUpdateTimeout = setTimeout(updateNotifications, settingsManager.settings.time_between_refresh);  
                            return;
                        }
                        notification_list = $.merge(results.notifications, results.mps);
                        async.map(notification_list, 
                            function(notification,cb){
                            return_notif = {
                                plugin_name : "unknown",
                                icon : "",
                                title : "unknown",
                                slug : "unknown",
                            }
                            switch(notification.type){
                                case "forum":
                                    return_notif = {
                                        categorie : "forum",
                                        icon : "https://thib3113.github.io/dealabs-extension/img/message.png",
                                        title : "Nouveau message sur le forum",
                                        slug : notification.id,
                                        text : notification.title,
                                        url  : notification.url
                                    };
                                    // getProfile(notification.member_id, function(err,user){
                                    //     this.cb(null, return_notif);
                                    // }.bind({cb:cb}));
                                break;
                                case "deal":
                                    return_notif = {
                                        categorie : "deals",
                                        icon : dealabs_protocol+"static.dealabs.com/"+notification.deal_thumb_image,
                                        title : "Nouvelle notification",
                                        slug : notification.id,
                                        text : notification.title,
                                        url  : notification.url
                                    };
                                break;
                                case "alert":
                                    return_notif = {
                                        categorie : "alertes",
                                        icon : dealabs_protocol+"static.dealabs.com/"+notification.deal_thumb_image,
                                        title : "Nouvelle alerte",
                                        slug : notification.id,
                                        text : notification.title,
                                        url  : notification.url
                                    };
                                break;
                                case "MP":
                                    return_notif = {
                                        categorie : "MPs",
                                        icon : notification.profile_image,
                                        title : "Nouveau message privé de "+notification.profile_username,
                                        slug : notification.id+notification.link_to_pm,
                                        text : notification.subject,
                                        url  : notification.link_to_pm
                                    };
                                break;
                            }
                            // if(notification.type!="forum"){
                            cb(null, return_notif);
                            // }
                            },
                            function(err,notification_list){
                                //all notifications listed
                                //notifications
                                current_deals = [];
                                notifications_counter = {
                                    'deals': {value:0},
                                    'alertes': {value:0},
                                    'MPs': {value:0},
                                    'forum': {value:0}
                                }

                                tempNotifs = [];
                                for (let notification of notification_list) {
                                    if(settingsManager.notifications_manage[notification.categorie]){
                                        notifications_counter[notification.categorie].value++;
                                        tempNotifs.push(notification)
                                    }
                                }
                                
                                var newNotificationsNotified = {};
                                var saveNotifications = {};
                                var notifs_to_send = [];
                                for (var i = tempNotifs.length - 1; i >= 0; i--) {

                                    //manage blacklists and sounds
                                    if(linkInfo = tempNotifs[i].url.match(/\.com\/([^\/]+)\/.*\/([0-9]+)[#|\?]/)){
                                        if(typeof settingsManager.settings.blacklist[linkInfo[1]+'-'+linkInfo[2]] != "undefined"){
                                            $.get(tempNotifs[i].url);
                                            // console.log(tempNotifs[i].categorie);
                                            notifications_counter[tempNotifs[i].categorie].value -= 1;
                                            continue;
                                        }
                                        if(typeof settingsManager.settings.notifications_with_sound[linkInfo[1]+'-'+linkInfo[2]] != "undefined"){
                                            if(typeof notificationsNotified[tempNotifs[i].slug] == "undefined" || notificationsNotified[tempNotifs[i].slug] == null){
                                                soundAlert();
                                            }
                                        }
                                    }

                                    if(typeof saveNotifications[tempNotifs[i].categorie] == "undefined")
                                        saveNotifications[tempNotifs[i].categorie] = [];
                                    saveNotifications[tempNotifs[i].categorie].push(tempNotifs[i]);

                                    if(typeof notificationsNotified[tempNotifs[i].slug] == "undefined" || notificationsNotified[tempNotifs[i].slug] == null){
                                        if(settingsManager.notifications_manage.desktop){
                                            notifs_to_send.push(tempNotifs[i]);
                                        }
                                    }
                                    newNotificationsNotified[tempNotifs[i].slug] = tempNotifs[i];
                                }
                                if(notifs_to_send.length<=6){
                                    for (var i = 0; i < notifs_to_send.length; i++) {
                                        send_desktop_notification(notifs_to_send[i].title, notifs_to_send[i].text, notifs_to_send[i].icon, notifs_to_send[i].url, notifs_to_send[i].slug);
                                    }
                                }
                                else{
                                    send_desktop_notification(
                                        "vous avez "+notifs_to_send.length+" notification"+(notifs_to_send.length>1?"s":"")+" non lue"+(notifs_to_send.length>1?"s":""),
                                        "vous avez "+notifs_to_send.length+" notification"+(notifs_to_send.length>1?"s":"")+" non lue"+(notifs_to_send.length>1?"s":""),
                                        "https://static.dealabs.com/images/profil/icon_profile_activity.png",
                                        "https://www.dealabs.com",
                                        "multinotif-"+Date.now(),
                                        function(items){
                                            list = [];
                                            for (var i = 0; i < items.length; i++) {
                                                list.push({
                                                    title : items[i].title,
                                                    message : items[i].text
                                                })
                                            }
                                            return list;
                                        }(notifs_to_send)
                                    )
                                }
                                
                                //save to not notify each refresh times
                                notificationsNotified = newNotificationsNotified;

                                nb_add = 0;
                                nb_add += notifications_counter['deals'].value;
                                nb_add += notifications_counter['alertes'].value;
                                nb_add += notifications_counter['MPs'].value;
                                nb_add += notifications_counter['forum'].value;
                                // plus = notifications_counter['forum'].plus?"+":"";
                                // nb_notifs = nb_add<1000? nb_add:"999+";
                                // send desktop notifications
                                if(nb_add > 0 ){
                                    extension.browserAction.getBadgeText({}, function(result){
                                        if(result != nb_add){
                                            extension.browserAction.setTitle({title:nb_add+' notification'+(nb_add>1?'s':'')});
                                            extension.browserAction.setBadgeText({text:''+nb_add});
                                            extension.browserAction.setBadgeBackgroundColor({color:'#0012FF'});
                                        }
                                    });
                                }
                                else{
                                    extension.browserAction.setTitle({title:'pas de notifications'});
                                    extension.browserAction.setBadgeText({text:''});
                                    extension.browserAction.setBadgeBackgroundColor({color:'#FFE400'});
                                }


                                // save notifications in local (for the popup)
                                extension.setStorage(
                                {
                                    'notifications':saveNotifications,
                                    'notifications_counter':notifications_counter
                                });

                                //update popup
                                popup = extension.getPopup();
                                if(popup.length >0){
                                    for (var i = 0; i < popup.length; i++) {
                                        popup[i].generate_popup();
                                    }
                                }
                                this.cb(true);
                                notificationUpdateTimeout = setTimeout(updateNotifications, settingsManager.settings.time_between_refresh);
                            }.bind({cb:this.cb})
                        );
                    }.bind({cb:cb}));
                }                
            },
            error:function(){
                iconState("error");
                notificationUpdateTimeout = setTimeout(updateNotifications, settingsManager.settings.time_between_refresh);            
            }
        })
    }

    function openInTab(url, loadedCB){
        cb = loadedCB || function(){};
        extension.openTab(
            { 
                url : url, 
                active : true, 
                onLoad : cb 
            }
        );
    }

    function cleanNotifications(){
        extension.getAllExtensions(function(notifications){
            for(id in notifications){
                notifications[id].close();
            }
        })
    }

    var checkImgurConnectionTimeout = 0;
    var checkImgurStatus = {
        status:false,
        lastTime : null
    };
    function checkImgurConnection(cb){
        cb = cb || function(){};
        if(checkImgurConnectionTimeout!=0)
            clearTimeout(checkImgurConnectionTimeout);
        
        imgurManager.checkConnection(function(response){
            checkImgurStatus = {
                status:(response!=false),
                lastTime : new Date().getTime()
            }
            checkImgurConnectionTimeout = setTimeout(checkImgurConnection, 1000*60*15); //check every 15 minutes
            cb(checkImgurStatus);
        });
    }

    extension.onMessage("getImgurStatus", function(datas, cb){
        cb(checkImgurStatus);
    },true);
    extension.onMessage("updateImgurStatus", function(datas, cb){
        current_date = new Date();
        if((current_date - lastUpdateRequested.imgur)/1000 < 10 ){
            cb({
                success:false,
                error:extension._(
                    "please wait $time$s before refresh",
                    moment.duration(
                        Math.ceil(
                            10 - (current_date - lastUpdateRequested.imgur)/1000
                        )
                    ,"seconds").format("mm[m]ss[s]", {forceLength:false})
                )
            });
            return;
        }
        else{
            //update to block fast dbl click
            lastUpdateRequested.imgur = new Date();
        }

        checkImgurConnection(function(status){
            lastUpdateRequested.imgur = new Date();
            cb({
                success:true,
                status:status
            });
        }.bind(this));
        return true;
    },true);


    notificationUpdateTimeout = 0;

    extension.removeAllContextMenu(function(){
        extension.addContextMenu({
            title    : 'Ouvrir ...',
            id       : 'open',
            contexts : ['browser_action']
        });
        extension.addContextMenu({
            title    : 'Dealabs',
            id       : 'home',
            parentId : 'open',
            contexts : ['browser_action'],
            onclick  : function(info){
                openInTab(dealabs_protocol+'www.dealabs.com');
            }
        });


        extension.addContextMenu({
            title : 'Mon profil',
            id: 'profile',
            parentId: 'open',
            contexts : ['browser_action'],
            enabled:false,
            onclick : function(info){
                extension.getStorage(['profil'], function(value){
                    openInTab(value.profil.link);
                });
            }
        });
        extension.addContextMenu({
            title : 'Mes MPs',
            id: 'myMps',
            parentId: 'open',
            contexts : ['browser_action'],
            enabled:false,
            onclick : function(info){
                extension.getStorage(['profil'], function(value){
                    openInTab(value.profil.link+"?tab=messaging&what=inbox");
                });
            }
        });
        extension.addContextMenu({
            title : 'Mes alertes',
            id: 'alertes',
            parentId: 'open',
            contexts : ['browser_action'],
            onclick : function(info){
                openInTab("https://www.dealabs.com/alerts/alerts.html");
            }
        });
        extension.addContextMenu({
            title : 'Mes deals sauvegardés',
            id: 'saved_deals',
            parentId: 'open',
            contexts : ['browser_action'],
            onclick : function(info){
                openInTab("https://www.dealabs.com/saved.html");
            }
        });
        extension.addContextMenu({
            title : 'Mon flux personnalisé',
            id: 'custom_flux',
            parentId: 'open',
            contexts : ['browser_action'],
            onclick : function(info){
                openInTab("https://www.dealabs.com/custom.html");
            }
        });

        extension.addContextMenu({
            title : 'Rafraichir',
            contexts : ['browser_action'],
            id: 'refresh',
            onclick : updateNotifications,
            enabled:false
        });
        extension.addContextMenu({
            title : 'Tout marquer comme vus',
            contexts : ['browser_action'],
            id: 'mark_all_read',
            onclick : remove_all,
            enabled:false
        });
        extension.addContextMenu({
            title : 'end_separator',
            contexts : ['browser_action'],
            id: 'end_separator',
            type:"separator"
        });
        extension.addContextMenu({
            title : 'Topic du plugin',
            contexts : ['browser_action'],
            id: 'plugin_topic',
            onclick : function(info){
                openInTab("https://www.dealabs.com/forums/le-site/annonces--nouveauts-du-site-modifications/plugin-plugin-chrome-pour-dealabs-non-officiel-/21068");
            }
        });
        extension.addContextMenu({
            title : 'Site du développeur',
            contexts : ['browser_action'],
            id: 'developper_website',
            onclick : function(info){
                openInTab("https://thib3113.fr?referer=dealabs_plugin");
            }
        });
    });

    extension.waitFor('connected', function(){
        extension.updateContextMenu("mark_all_read", {enabled:true});
        extension.updateContextMenu("myMps", {enabled:true});
        extension.updateContextMenu("profile", {enabled:true});
        extension.updateContextMenu("refresh", {enabled:true});
    })

    $(function(){
        extension.browserAction.onClicked.addListener(function(tab){
            var newURL = dealabs_protocol+"www.dealabs.com";
            extension.openTab({ url: newURL });
        });
        updateNotifications();
        checkImgurConnection();
    })
}
catch(e){
    try{
        extension.log(e.message, e.stack);

        //try to popup error
        extension.sendMessage("criticalError", {message:"Error from background page :<br>"+e.message});
    }
    catch(err){
        console.error(err);
    }
    finally{
        throw e;
    }
}