var mouse = {x: null, y: null};
var touch;
var drawingTool = 'pencil';
var canvas;
var canvasId = 'canvasDiv';

var timeAndRound = 'timeAndRound';
var timeInfo = 'timeInfo';
var roundInfo = 'roundInfo';
var wordsInfo = 'wordsInfo';
var drawingToolsDiv = 'drawingToolsDiv';
var usersDiv = 'users';
var panelMessages = 'panelMessages';
var panel = 'panel';
var send = 'send';
var messageInput = 'message';
var privateRoom = 'privateRoom';
var lblRoomCode = 'lblRoomCode';

var lineColour = '#000000';
var pencilSize = 0.005;
var eraserSize = 0.0125;

var ctx;
var points = [];
var auxPoints = [];
var drawingTools;
var canvasDisplay = 'none';
//var canvasDisplay = 'block';
var time = 90;
var stopTime = false;
var pr = false;
var drawer = false;

$(document).ready(function () {
    $(window).resize(respondCanvas);
    function respondCanvas()
    {
        changeSize();
    }
    respondCanvas();
    $("#message").on('keyup', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13)
        {
            handleMsg();
        }
    });
});
function changeSize()
{
    $('#canvas').remove();
    $('#canvas2').remove();
    /*var id = 'canvas';
    if (canvasId.split('_').length > 1)
    {
        id = 'canvas' + canvasId.split('_')[1];
    }
    $("#" + canvasId).append('<canvas width="1" height="1" id="' + id + '" style="position: relative; border: dotted; display: ' + canvasDisplay + ';">Canvas no soportado.</canvas>');*/
    canvas = document.getElementById(id);
    //var x_b = $(window).width() - document.getElementById('users').clientWidth - (document.getElementById('panelMessages').clientWidth * 0.3);
    //var x_b = $(window).width() - document.getElementById('users').clientWidth - (document.getElementById('panelMessages').clientWidth * 0.4);
    var x_b = (document.getElementById('well').clientWidth * 0.7) - 20;
    //var y_b = $(window).height() * 0.9;
    //var y_b = x_b * 0.46796875;
    var y_b = x_b * 0.4;
    var sizeMessages = (document.getElementById('body').clientHeight - 
        y_b + document.getElementById('imgLogo').clientHeight + document.getElementById('timeAndRound').clientHeight) * 0.5;
    console.log(document.getElementById('body').clientHeight, y_b, document.getElementById('imgLogo').clientHeight, document.getElementById('timeAndRound').clientHeight);
    console.log(sizeMessages);
    if (sizeMessages < 80)
    {
        //sizeMessages = document.getElementById('body').clientHeight;
        sizeMessages = 80;
    }
    //document.getElementById('panelMessages').style.maxHeight = sizeMessages + 'px';
    document.getElementById('panelMessages').style.maxHeight = sizeMessages + 'px';
    document.getElementById('panel').style.maxHeight = sizeMessages + 'px';
    //var b = $('#body');
    //alert(x_b + ', ' + y_b);
    //1280, 599
    //863.8, 404.23140624999996
    //289.2, 135.33656249999999
    //changeSize($(b).width(), ($(window).height() * 0.9), true);
    document.getElementById('imgLogo').style.width = (x_b * 0.3) + 'px';
    var map_size = [[], []];
    map_size[0] = (x_b);
    map_size[1] = (y_b);
    $('#canvas').remove();
    $('#canvas2').remove();
    var id = 'canvas';
    if (canvasId.split('_').length > 1)
    {
        id = 'canvas' + canvasId.split('_')[1];
    }
    $("#" + canvasId).append('<canvas width="' + map_size[0] + '" height="' + map_size[1] + '" id="' + id + '" style="position: relative; border: dotted; display: ' + canvasDisplay + ';">Canvas no soportado.</canvas>');
    canvas = document.getElementById(id);
    ctx = canvas.getContext('2d');
    var painting = document.getElementById(canvasId);
    var paint_style = getComputedStyle(painting);
    canvas.width = parseInt(paint_style.getPropertyValue('width'));
    canvas.height = parseInt(paint_style.getPropertyValue('height'));
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = lineColour;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var p = points;
    for (var i = 0; i < p.length; i++)
    {
        //ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.lineWidth = (canvas.width * p[i]['lineWidth']);
        if (p[i]['drawingTool'] == 'eraser')
        {
            ctx.strokeStyle = '#ffffff';
        }
        else
        {
            //ctx.strokeStyle = lineColour;
            ctx.strokeStyle = p[i]['colour'];
        }
        ctx.moveTo(canvas.width * p[i]['initial_pos'][0], canvas.height * p[i]['initial_pos'][1]);
        if (p[i]['others_pos'].length)
        {
            var sub_p = p[i]['others_pos'];
            for (var j = 0; j < sub_p.length; j++)
            {
                ctx.lineTo(canvas.width * sub_p[j][0], canvas.height * sub_p[j][1]);
            }
            ctx.stroke();
        }
    }
    mouse = {x: null, y: null};
    if (drawer)
    {
        canvas.addEventListener('touchstart', onTouch, false);
        canvas.addEventListener('touchend', onTouchUp, false);
        canvas.addEventListener('mousedown', onClic, false);
        canvas.addEventListener('mouseup', onUp, false);
        showDrawingTools(y_b);
    }
    else
    {
        canvas.removeEventListener('touchstart', onTouch, false);
        canvas.removeEventListener('touchend', onTouchUp, false);
        canvas.removeEventListener('mouseup', onUp, false);
        canvas.removeEventListener('mousemove', onMove, false);
    }
    //document.getElementById('users').style.width =( drawingTools[0]['size'][1] + 5) + 'px';
    //alert($(window).width() + ', ' + document.getElementById('users').clientWidth + ', ' + (document.getElementById('panelMessages').clientWidth * 0.4));
}
function onToolClic(e)
{
    if (e['target']['id'].split('_').length == 3)
    {
        lineColour = '#' + e['target']['id'].split('_')[2];
    }
    else
    {
        drawingTool = (e['target']['id'].split('_')[1]);
    }
}
function onToolTouch(event)
{
    if (event['target']['id'].split('_').length == 3)
    {
        lineColour = '#' + event['target']['id'].split('_')[2];
    }
    else
    {
        drawingTool = (event['target']['id'].split('_')[1]);
    }
}
function onTouch(event)
{
    if (event.targetTouches.length == 1)
    {
        showDrawingTools();
        touch = event.targetTouches[0];
        mouse.x = touch.pageX - this.offsetLeft - this.offsetParent.offsetLeft;
        mouse.y = touch.pageY - this.offsetTop - this.offsetParent.offsetTop;
        var colour = '#ffffff';
        if (drawingTool != 'eraser')
        {
            colour = lineColour;
        }
        points.push({
            'initial_pos' : [mouse.x / canvas.width, mouse.y / canvas.height], 
            'others_pos' : [], 
            'lineWidth' : pencilSize, 
            'colour' : colour, 
            'drawingTool' : drawingTool
        });
        ctx.lineWidth = (pencilSize * canvas.width);
        if (drawingTool == 'eraser')
        {
            ctx.strokeStyle = '#ffffff';
            points[points.length - 1]['lineWidth'] = eraserSize;
            points[points.length - 1]['colour'] = '#ffffff';
            ctx.lineWidth = (eraserSize * canvas.width);
        }
        else
        {
            ctx.strokeStyle = lineColour;
        }
        ctx.beginPath();
        ctx.moveTo(mouse.x, mouse.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        canvas.addEventListener('touchmove', onTouchMove, false);
        canvas.removeEventListener('mousedown', onPaint, false);
        canvas.removeEventListener('mouseup', onUp, false);
        canvas.removeEventListener('mousemove', onMove, false);
    }
}
function onTouchMove(e)
{
    touch = e.targetTouches[0]; 
    mouse.x = touch.pageX - this.offsetLeft - this.offsetParent.offsetLeft;
    mouse.y = touch.pageY - this.offsetTop - this.offsetParent.offsetTop;
    points[points.length - 1]['others_pos'].push([mouse.x / canvas.width, mouse.y / canvas.height]);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
}
function onTouchUp()
{
    points[points.length - 1]['others_pos'].push([mouse.x / canvas.width, mouse.y / canvas.height]);
    handleCanvas(points);
    canvas.removeEventListener('touchmove', onTouchMove, false);
}
function onClic(e)
{
    showDrawingTools();
    mouse.x = e.pageX - this.offsetLeft - this.offsetParent.offsetLeft;
    mouse.y = e.pageY - this.offsetTop - this.offsetParent.offsetTop;
    var colour = '#ffffff';
    if (drawingTool != 'eraser')
    {
        colour = lineColour;
    }
    points.push({
        'initial_pos' : [mouse.x / canvas.width, mouse.y / canvas.height], 
        'others_pos' : [], 
        'lineWidth' : pencilSize, 
        'colour' : colour, 
        'drawingTool' : drawingTool
    });
    ctx.lineWidth = (pencilSize * canvas.width);
    if (drawingTool == 'eraser')
    {
        ctx.strokeStyle = '#ffffff';
        points[points.length - 1]['lineWidth'] = eraserSize;
        points[points.length - 1]['colour'] = '#ffffff';
        ctx.lineWidth = (eraserSize * canvas.width);
    }
    else
    {
        ctx.strokeStyle = lineColour;
    }
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
    canvas.addEventListener('mousemove', onMove, false);
}
function onMove(e)
{
    mouse.x = e.pageX - this.offsetLeft - this.offsetParent.offsetLeft;
    mouse.y = e.pageY - this.offsetTop - this.offsetParent.offsetTop;
    //console.log(mouse.x, mouse.y);
    points[points.length - 1]['others_pos'].push([mouse.x / canvas.width, mouse.y / canvas.height]);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
}
function onUp()
{
    points[points.length - 1]['others_pos'].push([mouse.x / canvas.width, mouse.y / canvas.height]);
    handleCanvas(points);
    canvas.removeEventListener('mousemove', onMove, false);
}
function showWordLength(l)
{
    document.getElementById('waiting').style.display = 'none';
    /*var wI = document.getElementById(wordsInfo);
    wI.style.display = 'flex';
    wI.style.width = (l * 30) + 'px';
    var html = '';
    for (var i = 0; i < l; i++)
    {
        html += '<hr width="20px;" style="border-top: 2px solid #8c8b8b;">';
    }
    wI.innerHTML = html;*/
    var wI = document.getElementById('wordsInfo');
    wI.innerHTML = '<canvas width="' + ((24 * l) + 2) + '" height="20" id="canvasWordLength">Canvas no soportado.</canvas>';
    var canvasWordLength = document.getElementById('canvasWordLength');
    canvasWordLength = canvasWordLength.getContext('2d');
    var initial = 20;
    for (var i = 0; i < l; i++)
    {
        canvasWordLength.beginPath();
        canvasWordLength.moveTo((initial - 20), 18);
        canvasWordLength.lineTo(initial, 18);
        canvasWordLength.stroke();
        initial += 24;
    }
    changeSize();
}
function selectWord(i)
{
    document.getElementById('waiting').style.display = 'none';
    document.getElementById(wordsInfo).innerHTML = '<label>The word is: ' + words[Number(i.split('_')[1])] + '</label>';
    document.getElementById(drawingToolsDiv).style.display = 'block';
    handleWordSelected(words[Number(i.split('_')[1])]);
    drawer = true;
    changeSize();
}
function initTime()
{
    document.getElementById(timeInfo).style.display = 'block';
    t = time;
    var countdown = () => {
        var timerUpdate = setInterval( () => {
            if (stopTime)
            {
                clearInterval(timerUpdate);
                t = time;
                document.getElementById(timeInfo).style.display = 'none';
            }
            document.getElementById(timeInfo).innerHTML = 'Time remaining: ' + t;
            t--;
            if (t == 0)
            {
                clearInterval(timerUpdate);
                t = time;
                if (selectedUser == username)
                {
                    handleTimeOut();
                }
            }
        }, 1000);
    };
    countdown();
}
function updateUsersInfo()
{
    var ul = document.getElementById(usersDiv);
    var html = '';
    var tmp = [];
    for (var i = 0; i < users.length; i++)
    {
        /*html += '<table id="usersTable" style="border: solid;">';
        html += '<tr><td style="text-align: center; padding: 2px;">' + users[i][0] + '</td></tr>';
        html += '<tr><td style="text-align: center; padding: 2px;">Points: ' + users[i][1] + '</td></tr>';
        if (users[i][0] == selectedUser)
        {
            html += '<tr><td style="text-align: center; padding: 2px;"><span class="glyphicon glyphicon-pencil"></span></td></tr>';
        }
        html += '</table>';*/
        var subHtml = users[i][0] + ', ' + users[i][1];
        if (users[i][0] == selectedUser)
        {
            subHtml += '<span class="glyphicon glyphicon-pencil"></span>';
            //html += '<tr><td style="text-align: center; padding: 2px;"><span class="glyphicon glyphicon-pencil"></span></td></tr>';
        }
        html += '<div id="u_' + i + '" style="text-align: center; padding: 2px; border: solid;">' + subHtml + '</div>';
    }
    ul.innerHTML = html;
}
function showDrawingTools(y = null)
{
    document.getElementById(drawingToolsDiv).style.display = 'block';
    //document.getElementById(drawingToolsDiv).style.display = 'flex';
    var r = document.getElementById(drawingToolsDiv);
    var html = '';
    drawingTools = [
        {
            'type' : 'pencil', 
            'pos' : [
                [
                    [
                        [0.7, 0.1], 
                        [0.9, 0.25], 
                        [0.85, 0.3], 
                        [0.65, 0.15], 
                        [0.7, 0.1]
                    ], '#e6e7c5'
                ], 
                [
                    [
                        [0.65, 0.15], 
                        [0.23, 0.57], 
                        [0.4, 0.75],  
                        [0.85, 0.3]
                    ], '#000000'
                ], 
                [//casi punta
                    [
                        [0.23, 0.57], 
                        [0.189, 0.73], 
                        [0.245, 0.79], 
                        [0.4, 0.75]
                    ], '#e6e7c5'
                ], 
                [//punta
                    [
                        [0.189, 0.73], 
                        [0.17, 0.81], 
                        [0.245, 0.79]
                    ], '#000000'
                ]
            ], 
            'size' : [60, 60]
        }, 
        {
            'type' : 'colour', 
            'colour' : '#000000', 
            'size' : [60, 60]
        }, 
        {
            'type' : 'colour', 
            'colour' : '#0000ff', 
            'size' : [60, 60]
        }, 
        {
            'type' : 'colour', 
            'colour' : '#ff0000', 
            'size' : [60, 60]
        }, 
        {
            'type' : 'colour', 
            'colour' : '#ebff00', 
            'size' : [60, 60]
        }, 
        {
            'type' : 'colour', 
            'colour' : '#00ff00', 
            'size' : [60, 60]
        }, 
        {
            'type' : 'colour', 
            'colour' : '#ffffff', 
            'size' : [60, 60]
        }, 
        {
            'type' : 'colour', 
            'colour' : '#fb43ff', 
            'size' : [60, 60]
        }, 
        {
            'type' : 'colour', 
            'colour' : '#412900', 
            'size' : [60, 60]
        }, 
        {
            'type' : 'colour', 
            'colour' : '#8400ab', 
            'size' : [60, 60]
        }, 
        {
            'type' : 'colour', 
            'colour' : '#ffa800', 
            'size' : [60, 60]
        }, 
        {
            'type' : 'colour', 
            'colour' : '#545454', 
            'size' : [60, 60]
        }, 
        {
            'type' : 'eraser', 
            'pos' : [
                [
                    [
                        [0.7, 0.1],
                        [0.15, 0.65], 
                        [0.3, 0.85], 
                        [0.85, 0.3],
                        [0.9, 0.25], 
                        [0.7, 0.1]
                    ], '#feabc7'
                ]/*, 
                [
                    [
                        [0.85, 0.64],
                        [0.85, 0.2],
                        [0.9, 0.25]
                    ], '#000000'
                ]*/
            ], 
            'size' : [60, 60]
        }
    ];
    //console.log(drawingTools[0]['size']);
    //r.style.height = (drawingTools[0]['size'][1] + 5) + 'px';
    if (y != null)
    {
        r.style.height = y + 'px';
    }
    for (var i = 0; i < drawingTools.length; i++)
    {
        /*html += '<table>';
        if (drawingTools[i]['type'] == 'colour')
        {
            html += '<tr><td style="text-align: center; padding: 5px;">' + '<canvas width="' + drawingTools[i]['size'][0] + '" height="' + drawingTools[i]['size'][1] + '" id="canvas_' + drawingTools[i]['type'] + '_' + drawingTools[i]['colour'].split('#')[1] + '">Canvas no soportado.</canvas></td></tr>';
        }
        else
        {
            html += '<tr><td style="text-align: center; padding: 5px;">' + '<canvas width="' + drawingTools[i]['size'][0] + '" height="' + drawingTools[i]['size'][1] + '" id="canvas_' + drawingTools[i]['type'] + '">Canvas no soportado.</canvas></td></tr>';
        }
        html += '</table>';*/
        if (drawingTools[i]['type'] == 'colour')
        {
            html += '<canvas width="' + drawingTools[i]['size'][0] + '" height="' + drawingTools[i]['size'][1] + '" id="canvas_' + drawingTools[i]['type'] + '_' + drawingTools[i]['colour'].split('#')[1] + '" style="padding: 0.2%">Canvas no soportado.</canvas><br>';
        }
        else
        {
            html += '<canvas width="' + drawingTools[i]['size'][0] + '" height="' + drawingTools[i]['size'][1] + '" id="canvas_' + drawingTools[i]['type'] + '" style="padding: 0.2%">Canvas no soportado.</canvas><br>';
        }
    }
    r.innerHTML = html;
    for (var i = 0; i < drawingTools.length; i++)
    {
        var canvasTool;
        if (drawingTools[i]['type'] == 'colour')
        {
            canvasTool = document.getElementById('canvas_' + drawingTools[i]['type'] + '_' + drawingTools[i]['colour'].split('#')[1]);
        }
        else
        {
            canvasTool = document.getElementById('canvas_' + drawingTools[i]['type']);
        }
        canvasTool = canvasTool.getContext('2d');
        if (drawingTools[i]['type'] == 'colour')
        {
            canvasTool.fillStyle = drawingTools[i]['colour'];
            canvasTool.beginPath();
            canvasTool.arc((drawingTools[i]['size'][0] / 2), (drawingTools[i]['size'][1] / 2), drawingTools[i]['size'][0] / 2, 0, 2 * Math.PI);
            canvasTool.fill();
            //canvasTool.fill();
            canvasTool = document.getElementById('canvas_' + drawingTools[i]['type'] + '_' + drawingTools[i]['colour'].split('#')[1]);
        }
        else
        {
            canvasTool.fillStyle = '#ffffff';
            //feb0ca
            /*canvasTool.beginPath();
            canvasTool.moveTo(0, 0);
            canvasTool.lineTo(drawingTools[i]['size'][0], 0);
            canvasTool.lineTo(drawingTools[i]['size'][0], drawingTools[i]['size'][1]);
            canvasTool.lineTo(0, drawingTools[i]['size'][1]);
            canvasTool.lineTo(0, 0);*/
            canvasTool.beginPath();
            canvasTool.arc((drawingTools[i]['size'][0] / 2), (drawingTools[i]['size'][1] / 2), drawingTools[i]['size'][0] / 2, 0, 2 * Math.PI);
            canvasTool.fill();
            canvasTool.stroke();
            for (var j = 0; j < drawingTools[i]['pos'].length; j++)
            {
                if (drawingTools[i]['pos'][j][0].length)
                {
                    canvasTool.beginPath();
                    canvasTool.moveTo((drawingTools[i]['size'][0] * drawingTools[i]['pos'][j][0][0][0]), (drawingTools[i]['size'][1] * drawingTools[i]['pos'][j][0][0][1]));
                    for (var k = 1; k < drawingTools[i]['pos'][j][0].length; k++)
                    {
                        canvasTool.lineTo((drawingTools[i]['size'][0] * drawingTools[i]['pos'][j][0][k][0]), (drawingTools[i]['size'][1] * drawingTools[i]['pos'][j][0][k][1]));
                    }
                    if (drawingTools[i]['pos'][j][1] != null)
                    {
                        canvasTool.fillStyle = drawingTools[i]['pos'][j][1];
                        canvasTool.fill();
                    }
                    canvasTool.stroke();
                }
            }
            canvasTool = document.getElementById('canvas_' + drawingTools[i]['type']);
        }
        canvasTool.addEventListener('touchstart', onToolTouch, false);
        canvasTool.addEventListener('mousedown', onToolClic, false);
    }
}
function rematch()
{
    socket.emit('rematch', JSON.stringify({
        type: 'rematch',
        user: username, 
        roomCode: roomCode
    }));
}