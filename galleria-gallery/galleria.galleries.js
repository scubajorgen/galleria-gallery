/***************************************************************************\
*
*  Extension for galleria.io slideshow to support galleries and albums
*  Normally the galleries path ('galleries') is part of the website.
*  However, it can also be used using a galleries location that is protected
*  with basic authentication
*
\***************************************************************************/

var publicGalleriesPath   ='galleries';
var protectedGalleriesPath='https://some.location.com/galleries';
var galleriaTheme         ='';
var imageDir              ='image';
var panoDir               ='panorama';
var videoDir              ='video';
var thumbnailDir          ='thumbnail';
var albumThumbnailFile    ='thumbnail.jpg';
var backItems             =new Array();
var currentGallery        =null;
var currentAlbum          =null;
var currentDiv            =null;
var currentOptions        =null;     

/***************************************************************************\
* This method initializes and shows the gallery
\***************************************************************************/
function showGalleria(imageData, imageIndex, options)
{
    var defaultOptions;
    var options;
    var i;
    var gallerias;
    
    defaultOptions=
    {
        theme: 'twelve',
        transition: 'fade',
        touchTransition: 'fade',
        fullscreenTransition: 'fade',
        transitionSpeed: 2000,
        imageCrop: false,
        thumbnails: true,
        fullscreenDoubleTap: true,
        pauseOnInteraction: true,
        showImagenav: true,
        showInfo: true,
        autoplay: 6000,
        idleMode: true,
        idleTime: 6000,
        lightbox: false,
        maxVideoSize: 1300
    };
    
    if (options===null)
    {
      options=defaultOptions;
    }
    options.dataSource=imageData;
    options.show      =imageIndex;

    // Destroy previous instances
    gallerias=Galleria.get();
    i=0;
    while (i<gallerias.length)
    {
      gallerias[i].destroy();
      i++;
    }
    // Create new
    Galleria.loadTheme(galleriaTheme);
    Galleria.run('.galleria', options); 
}

/***************************************************************************\
* Find the index of the album, given the name
\***************************************************************************/
function findAlbumIndex(albums, albumName)
{
    var i;
    var index;
    
    index   =-1;
    i       =0;
    while (i<albums.length && index<0)
    {
        if ((albums[i].directory==albumName) || (albums[i].name==albumName))
        {
            index=i;
        }
        i++;
    }
    return index;
}

/***************************************************************************\
* Show (panorama) image as browsable panorma using panolens
\***************************************************************************/
function showPanorama(url, isProtected=false)
{   
    var container;
    var viewer;
    var panorama;

    backItems.push({type: 'image', 
                    galleryName: currentGallery, 
                    albumId: currentAlbum, 
                    imageId: Galleria.get(0).getIndex(), 
                    div: currentDiv,
                    isProtected: isProtected});

    container=document.getElementById( 'main' );
    container.innerHTML="";
    panorama = new PANOLENS.ImagePanorama( url );
    viewer = new PANOLENS.Viewer( { container: container } );
    viewer.add( panorama );
}

/***************************************************************************\
* Show video
\***************************************************************************/
function showVideo(url, isProtected=false)
{   
    var html;
    
    backItems.push({type: 'image', 
                    galleryName: currentGallery, 
                    albumId: currentAlbum, 
                    imageId: Galleria.get(0).getIndex(), 
                    div: currentDiv,
                    isProtected: isProtected});

    html="<video id=\"player\" width=\"100%\" height=\"100%\" controls src=\""+url+"\">";
    html+="</video>";
    $("#main").html(html);
}

/***************************************************************************\
* Show the album
\***************************************************************************/
function showAlbum(album, galleryName, albumIndex, imageIndex, isProtected, div, options)
{
    var images;
    var image;
    var divString;
    var albumName;
    var albumDirectory;
    var galleriaData;
    var galleriesPath;
    var i;    
    
    // Add a div with the galleria class to the main view
    galleriesPath   =isProtected?protectedGalleriesPath:publicGalleriesPath;
    document.getElementById(div).innerHTML='<div class=\"galleria\"></div>';
    galleriaData    =new Array();
    images          =album.images;
    albumDirectory  =album.directory;
    i=0;
    while (i<images.length)
    {
        image=images[i];     
        galleriaData[i]=new Object();
        galleriaData[i].title=image.title;
        galleriaData[i].description=image.caption;
        
        if (image.captureDateTime !== undefined)
        {
            galleriaData[i].description+=" ("+image.captureDateTime+")";
        }
        
        if (image.image !== undefined)
        {
            galleriaData[i].image=galleriesPath+'/'+galleryName+'/'+albumDirectory+'/'+imageDir+'/'+image.image;
            galleriaData[i].thumb=galleriesPath+'/'+galleryName+'/'+albumDirectory+'/'+thumbnailDir+'/'+image.image;
            if (image.type !== undefined)
            {
                if (image.type=='panorama')
                {
                    galleriaData[i].link="javascript:showPanorama(\""+galleriesPath+'/'+galleryName+'/'+albumDirectory+'/'+panoDir+'/'+image.image+"\");";
                }
                else if (image.type=='video')
                {
                    galleriaData[i].link="javascript:showVideo(\""+galleriesPath+'/'+galleryName+'/'+albumDirectory+'/'+videoDir+'/'+image.video+"\");";
                }
            }
        }
        // youtube, vimeo, etc
        else if (image.video !== undefined)
        {
            galleriaData[i].video=image.video;
        }
        i++;
    }        
    showGalleria(galleriaData, imageIndex, options);               
    currentGallery=galleryName;
    currentAlbum  =albumIndex;
    currentDiv    =div;
    currentOptions=options;
}


/***************************************************************************\
* Process the JSON gallery definition file:
* - Extract the album
* - Add the images to the div
* - Show the gallery
\***************************************************************************/

function processJsonAlbumFromAlbumDir(e, galleryName, albumIndex, imageIndex, isProtected, div, options)
{
    var gallery; 
    var albums;
    var album;
    var images;
    var image;
    var divString;
    var albumName;
    var albumDirectory;
    var galleriaData;
    var galleriesPath;
    var i;

    if (e.readyState == 4 && e.status == 200) 
    {
        album         =JSON.parse(e.responseText);

        albumName       =album.name;
       
        
        // Convert data to galleria format
        images=album.images;
        showAlbum(album, galleryName, albumIndex, imageIndex, isProtected, div, options);
    }
}




/***************************************************************************\
* Process the JSON gallery definition file:
* - Extract the album
* - Add the images to the div
* - Show the gallery
\***************************************************************************/

function processJsonAlbum(e, galleryName, albumIndex, imageIndex, isProtected, div, options)
{
    var gallery; 
    var albums;
    var album;
    var images;
    var image;
    var divString;
    var albumName;
    var albumDirectory;
    var galleriaData;
    var galleriesPath;
    var i;

    if (e.readyState == 4 && e.status == 200) 
    {
        galleriesPath =isProtected?protectedGalleriesPath:publicGalleriesPath;
        gallery       =JSON.parse(e.responseText);
        albums        =gallery.albums;
        // If not an integer is passed but a name, find the index based on name
        if (albumIndex != parseInt(albumIndex, 10))
        {
            albumIndex=findAlbumIndex(albums, albumIndex);
        }
        if ((albumIndex>=0) && (albumIndex<albums.length))
        {   
            album=albums[albumIndex];     
            
            albumName       =album.name;
            albumDirectory  =album.directory;
            
            
            // Convert data to galleria format
            images=album.images;
            if (images==null)
            {
                // If there are no images in the album, try the album.json in the album dir
                var xmlhttp = new XMLHttpRequest();
                var albumFileName;

                albumFileName=galleriesPath+'/'+galleryName+'/'+albumDirectory+'/album.json';
                xmlhttp.onreadystatechange = function(){processJsonAlbumFromAlbumDir(this, galleryName, albumIndex, imageIndex, isProtected, div, options);};
                xmlhttp.open("GET", albumFileName, true);
                if (isProtected)
                {
                    xmlhttp.withCredentials=true
                }
                xmlhttp.send();    
            }
            else
            {
                showAlbum(album, galleryName, albumIndex, imageIndex, isProtected, div, options);
            }
        }
    }
}


/***************************************************************************\
* Show galleria album defined in directory and index
\***************************************************************************/
function showGalleriaAlbum(galleryName, albumIndex, imageIndex, isProtected, div, options)
{
    var xmlhttp = new XMLHttpRequest();
    var galleryFileName;
    var galleriesPath;
 
    galleriesPath=isProtected?protectedGalleriesPath:publicGalleriesPath;
    galleryFileName=galleriesPath+'/'+galleryName+'/gallery.json';
    xmlhttp.onreadystatechange = function(){processJsonAlbum(this, galleryName, albumIndex, imageIndex, isProtected, div, options);};
    xmlhttp.open("GET", galleryFileName, true);
    if (isProtected)
    {
        xmlhttp.withCredentials=true
    }
    xmlhttp.send();    
}


/***************************************************************************\
* Show the selected album in current gallery
\***************************************************************************/

function showSelectedGalleryAlbum(e, galleryName, albumId, isProtected, div, options)
{
    backItems.push({type: 'gallery', 
                    galleryName: galleryName, 
                    albumId: -1, 
                    imageId: -1, 
                    div: div,
                    isProtected: isProtected});
    $("#menu-item-close").show();
      
    processJsonAlbum(e, galleryName, albumId, 0, isProtected, div, null);
}

/***************************************************************************\
* Show the gallery of albums
\***************************************************************************/

function processJsonGalleryOverview(e, galleryName, columns, isProtected, div)
{
    var html;
    var i;
    var divElement;
    var gallery;
    var albums;
    var cells;
    var cellClass;
    var galleriesPath;
    
    if (e.readyState == 4 && e.status == 200) 
    {
        galleriesPath=isProtected?protectedGalleriesPath:publicGalleriesPath;
        gallery = JSON.parse(e.responseText);
        albums  =gallery.albums;
        
        html='';
        html+='<div class=\"gallery\" id=\"gallery\">';
        if (albums.length>0)
        {   
            i=0;
            cells=albums.length;
            if (albums.length%columns>0)
            {
                cells+=columns-(albums.length%columns);
            }
            while (i<cells)
            {
                if (i%columns==0)
                {
                    if (i/columns%2==0)
                    {
                        cellClass='galleryCellEvenRow';
                    }
                    else
                    {
                        cellClass='galleryCellOddRow';
                    }
                }                
                
                if (i<albums.length)
                {
                    html+='<div class=\"'+cellClass+'\" albumId=\"'+i+'\">';
    
                    html+='<div class=\"galleryCellTitle\">';
                    html+='<b>'+albums[i].name+'</b>';
                    html+='</div>';
    
                    html+='<div class=\"galleryCellDescription\">';
                    html+=albums[i].description;
                    html+='</div>';
    
                    html+='<div class=\"galleryCellImage\">';
                    html+='<img src=\"'+galleriesPath+'/'+galleryName+'/'+albums[i].directory+'/thumbnail.jpg'+'\" class=\"galleryCellThumbnail\">'
                    html+='</div>';
                    
                    html+='</div>';
                    
                }
                else
                {
                    html+='<div class=\"'+cellClass+'"></div>';
                }
                
                i++;
            }
        }
        
        html+='</div>';
        
        divElement=document.getElementById(div);
        divElement.innerHTML=html;

        $('.galleryCellEvenRow').css('width', (100/columns-0.2).toString()+"%");
        $('.galleryCellOddRow' ).css('width', (100/columns-0.2).toString()+"%");
        $('.galleryCellEvenRow').css('margin', "0.1%");
        $('.galleryCellOddRow' ).css('margin', "0.1%");
        $(".galleryCellEvenRow").click(function(){showSelectedGalleryAlbum(e, galleryName, $(this).attr("albumId"), isProtected, div, null);});
        $(".galleryCellOddRow").click(function(){showSelectedGalleryAlbum(e, galleryName, $(this).attr("albumId"), isProtected, div, null);});
    }
}



/***************************************************************************\
* Show galleria album defined in directory and index
\***************************************************************************/

function showGallery(galleryName, div, isProtected=false)
{   
    var galleriesPath;
    var galleryFileName;
    var html;
    var columns=3;
    var xmlhttp;
    
    galleriesPath=isProtected?protectedGalleriesPath:publicGalleriesPath;
    galleryFileName=galleriesPath+'/'+galleryName+'/gallery.json';
    
    xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function(){processJsonGalleryOverview(this, galleryName, columns, isProtected, div);};
    xmlhttp.open("GET", galleryFileName, true);
    if (isProtected)
    {
        xmlhttp.withCredentials=true;
    }
    xmlhttp.send();    
}

/***************************************************************************\
* Back function: return to previous image, album or gallery
\***************************************************************************/
function back()
{
    if (backItems.length>0)
    {
        backItem=backItems.pop();
        if (backItem.type=='gallery')
        {
            showGallery(backItem.galleryName, backItem.div, backItem.isProtected);
        }
        else if (backItem.type=='album')
        {
            showGalleriaAlbum(backItem.galleryName, backItem.albumId, 0, backItem.isProtected, backItem.div, null);
        }
        else if (backItem.type=='image')
        {
            showGalleriaAlbum(backItem.galleryName, backItem.albumId, backItem.imageId, backItem.isProtected, backItem.div, null);
        }
    }
    if (backItems.length==0)
    {
        $("#menu-item-close").hide();
    }
}


/***************************************************************************\
* Initialise the gallery stuff
\***************************************************************************/
function initialiseGallery(theme)
{
  galleriaTheme=theme;
  $("#menu-item-close").click(function(){back()});
  $("#menu-item-close").hide();
}
