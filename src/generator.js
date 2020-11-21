const dungeon_table = document.querySelector('.dungeon_table');
const dungeon_canvas = document.querySelector('.dungeon_canvas');

//Forms
const dungeon_generate_form = document.querySelector('.dungeon_generate_form');
const img_upload_form = document.querySelector('.img_upload_form');

const export_button = document.querySelector('.export_button');

const error_msg = document.querySelector('.error_msg');

var directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

var ground_img = new Image();
var wall_img = new Image();

//  Load images
ground_img.crossOrigin = "anonymous";
wall_img.crossOrigin = "anonymous";
ground_img.src = "https://raw.githubusercontent.com/jokentertainment/Dungeon-Generator-Images/master/ground_s.png";
wall_img.src = "https://raw.githubusercontent.com/jokentertainment/Dungeon-Generator-Images/master/wall_s.png";

var square_size = 16;
var wall_square_size = 16;
var ground_square_size = 16;
 
//Create map array for the grid. Fill the array with the value of the num.
function create_map(num, width, height)
{
    let map = [];
    for (let row=0; row<height; row++) 
    {
        map.push([]);
        for (let col=0; col<width; col++) 
        {
            map[row].push(num);
        }
    }
    return map;
}

//Generate dungeon button
dungeon_generate_form.addEventListener('submit', function(e) {
    e.preventDefault();

    if (wall_square_size === ground_square_size) 
    {
        error_msg.textContent = "";
        main();
    }
    else error_msg.textContent = "Error: Wall and path tiles dont have the same dimensions!";
    // else alert("Error: Wall and path tiles dont have the same dimensions!");
});

//main function which calls everything
function main()
{
     //Dimensions
     let dim_width = document.querySelector('.dim_width').value;
     let dim_height = document.querySelector('.dim_height').value;
 
     //Methods
     let map = generate_dungeon(dim_width, dim_height);
     //visualize_map_as_table(dim_width, dim_height, map);
     create_canvas(dim_width, dim_height, map);
}

main();

//Generates dungeon
function generate_dungeon(width, height) 
{
    //Tunnels
    let max_tunnels = document.querySelector('.max_tunnels').value;
    let max_tunnel_length = document.querySelector('.max_tunnel_length').value;
    //Select a random start position
    let current_row;
    let current_col;

    do 
    {
        current_row = Math.floor(Math.random() * height);
        current_col = Math.floor(Math.random() * width);
    }
    while (current_row === 0 || current_col === 0)

    let last_direction = [];
    let rand_direction;

    let map = create_map(0, width, height);
    
    //Draw tunnels
    while (max_tunnels > 0) 
    {
        do rand_direction = directions[Math.floor(Math.random() * directions.length)];
        //Check if we dont override the previous tunnel
        while ((rand_direction[0] === last_direction[0] && rand_direction[1] === last_direction[1]) ||
            (rand_direction[0] === -last_direction[0] && rand_direction[1] === -last_direction[1]))

        var rand_tunnel_length = Math.floor(Math.random() * max_tunnel_length);
        var tunnel_length = 0;

        while (tunnel_length < rand_tunnel_length) 
        {
            //Check borders
            if ((current_row === 0 && rand_direction[0] === -1) || 
                (current_row === height-1 && rand_direction[0] === 1) ||
                (current_col === 0 && rand_direction[1] === -1) || 
                (current_col === width-1 && rand_direction[1] === 1)) break;
            else
            {
                if (current_row + rand_direction[0] === 0 ||
                    current_row + rand_direction[0] === height-1 ||
                    current_col + rand_direction[1] === 0 || 
                    current_col + rand_direction[1] === width-1) break;

                map[current_row][current_col] = 1;
                current_row += rand_direction[0];
                current_col += rand_direction[1];
                tunnel_length += 1;
            }
        }

        if (tunnel_length > 0) 
        {
            last_direction = rand_direction;
            max_tunnels -= 1;
        }
    }
    return map;
}

//Creates the dungeon with the actual images
function create_canvas(width, height, map)
{
    //Set width and height of the canvas
    dungeon_canvas.width = width * square_size;
    dungeon_canvas.height = height * square_size;

    var context = dungeon_canvas.getContext("2d");
    context.clearRect(0, 0, dungeon_canvas.width, dungeon_canvas.height);

    //Draw dungeon
    for (let row=0; row<height; row++) 
    {
        for (let col=0; col<width; col++)  
        {
            var x = col * square_size;
            var y = row * square_size;

            context.save();
            context.rect(x, y, square_size, square_size);
            context.clip();
            
            if (map[row][col] == 0) context.drawImage(wall_img, x, y);
            else context.drawImage(ground_img, x, y);
            
            context.restore();
        }
    }
}

//Dungeon export
export_button.addEventListener('click', function() {
    
    dungeon_canvas.getContext('2d');

    var saveAs = function(uri, filename) {
        var link = document.createElement('a');
        if (typeof link.download === 'string') {
            document.body.appendChild(link); // Firefox requires the link to be in the body
            link.download = filename;
            link.href = uri;
            link.click();
            document.body.removeChild(link); // remove the link when done
        } else {
            location.replace(uri);
        }
    };

    var img = dungeon_canvas.toDataURL("image/png"),
        uri = img.replace(/^data:image\/[^;]/, 'data:application/octet-stream');

    saveAs(uri, 'my_dungeon.png'); 
});

var load_wall_img = function(event) 
{
    wall_img.src = URL.createObjectURL(event.target.files[0]);  
    wall_img.onload = function()
    {
        if  (this.width !== this.height) 
        {
            // alert("Error: Please upload a square tile!");
            error_msg.textContent = "Error: Please upload a square tile!";
            document.querySelector('.wall_img_file').value = '';
            wall_img.src = "https://raw.githubusercontent.com/jokentertainment/Dungeon-Generator-Images/master/wall_s.png";
            return;
        }

        error_msg.textContent = "";
        square_size = this.width;
        wall_square_size = this.width;
    }
}

var load_ground_img = function(event) 
{
    ground_img.src = URL.createObjectURL(event.target.files[0]);
    ground_img.onload = function()
    {
        if  (this.width !== this.height) 
        {
            // alert("Error: Please upload a square tile!");
            error_msg.textContent = "Error: Please upload a square tile!";
            document.querySelector('.ground_img_file').value = '';
            ground_img.src = "https://raw.githubusercontent.com/jokentertainment/Dungeon-Generator-Images/master/ground_s.png";
        }

        error_msg.textContent = "";
        square_size = this.width;
        ground_square_size = this.width;
    }
}

// function visualize_map_as_table(width, height, map) 
// {
//     //Empty table
//     while (dungeon_table.firstChild) dungeon_table.removeChild(dungeon_table.firstChild);

//     //Form table
//     for (let row=0; row<height; row++) 
//     {
//         let canvas_row = document.createElement('tr');
//         dungeon_table.appendChild(canvas_row);

//         for (let col=0; col<width; col++) 
//         {
//             let canvas_cell = document.createElement('td');
//             canvas_row.appendChild(canvas_cell);
            
//             //Set color
//             if (map[row][col] == 0) canvas_cell.style.backgroundColor = 'Red';
//             else canvas_cell.style.background = 'Blue';
//         }
//     }
// }