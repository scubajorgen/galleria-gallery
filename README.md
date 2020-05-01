# galleria-gallery
## Introduction
[Galleria](https://galleriajs.github.io/) is an excellent html5 image viewer with lots of options. However it only presents
a one series of photos. It lacks the option to present a series of albums. Here comes in galleria-gallery. It
offers an overview of albums that can be clicked. When clicked it presents the album using Galleria.
Gallery and albums are defined by means of JSON files.

## Usage
The galleria-gallery consists of two files: /galleria-gallery/galleria.galleries.js and /galleria-gallery/galleria.galleries.css.
Ofcourse it needs jquery and galleria.

```
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/galleria/1.6.1/galleria.min.js"></script>
  <LINK rel="stylesheet" type="text/css" HREF="galleria-gallery/galleria-gallery.css" TITLE="Normal Style">
  <script src="galleria-gallery/galleria.galleries.js"></script>
```

When your page has loaded, simply call 

```
  initialiseGallery('https://cdnjs.cloudflare.com/ajax/libs/galleria/1.6.1/themes/twelve/galleria.twelve.min.js'); 
  showGallery('gallery1', 'main');
```
In this call 'gallery1' is the gallery directory and 'main' the div id that is used to for showing the gallery.

## File structure
The gallery file structure is
```
  gallerydirectory
    firstalbumdirectory
      image
      thumbnail
      album.json
      thumbnail.jpg
    secondalbumdirectory
      image
      thumbnail
      album.json
      thumbnail.jpg
    ...
    gallery.json
```

The directory **images** will contain the image files e.g. in 1920x1080 pixel format. The **thumbnail** contains the same files 
with the same name but in a smaller format, e.g. 250x141 pixel format. The file **thumbnail.json** contains the album thumbnail 
that is shown in the gallery overview.
###
The gallery contains two types of JSON files. The first is obligatory and is **gallery.json**

```
{
  "name": "Gallery Name",
  "description": "Gallery description",
  "albums": 
  [
    {
      "name": "First album name",
      "description": "First album description",
      "directory": "firstalbumdirectory",
      "thumbnail" : "optionalthumbnail.jpg",
      "images": 
      [
        {
          "title": "image title",
          "caption": "Image caption",
          "image": "image.jpg",
          "captureDateTime": "2018-07-12 15:46:29"
        }, 
        ...
      ]
    }, 
    ...
  ]
}
```

If the gallery contains many albums and many images, the file will become large. It is possible to omit the images in **gallery.json**
and move them to the **album.json** file.

The file **gallery.json** will become:

```
{
  "name": "Gallery Name",
  "description": "Gallery description",
  "albums": 
  [
    {
      "name": "First album name",
      "description": "First album description",
      "directory": "firstalbumdirectory"
    }, 
    {
      "name": "Second album name",
      "description": "Second album description",
      "directory": "secondalbumdirectory"
    }, 
    ...
  ]
}
```

The file **album.json** in the firstalbumdirectory will become

```
    {
      "name": "Omitted",
      "description": "omitted",
      "directory": "omitted",
      "images": 
      [
        {
          "title": "image title",
          "caption": "Image caption",
          "image": "image.jpg",
          "captureDateTime": "2018-07-12 15:46:29"
        }, 
        ...
      ]
    }

```
