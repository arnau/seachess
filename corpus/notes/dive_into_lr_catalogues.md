---
type: note
id: dive-into-lightroom-catalogues
publication_date: 2022-02-14
author: arnau
status: published
tags:
  - photography
  - tool
  - data
---
# Dive into Lightroom catalogues

This note captures my learnings on the contents of the [Adobe Lightroom](https://en.wikipedia.org/wiki/Adobe_Lightroom) catalogues, particularly its “Library” module.

<!-- body -->

This entry is about **Lightroom version 11**. I have no expectation of any of this holding true for past or future versions. I have only inspected a catalogue from the MacOS version so I don't know if any of my findings are specific to this operating system.

The following will assume a catalogue named “squirrel” so file and directory names will match that.


## Overview

A catalogue is composed of a few [SQLite] databases and some auxiliary files.

- `squirrel.lrcat`: _The_ catalogue. 116 tables with information about the images, folder structure, metadata (XMP, etc), development history, etc.
- `squirrel Helper.lrdata/helper.db`: 22 tables to manage the search using [FTS5].
- `squirrel Previews.lrdata/previews.db`: 11 tables to manage the previews stored in disk as `.rlprev` image pyramids.
- `squirrel Previews.lrdata/root-pixels.db`: 2 tables to manage small JPEG thumbnails.


### Database schema

The schema is large so I will focus on the core tables from where the rest hangs. Some tables have redundant information, likely to be convenience denormalisation and precomputed values.

To inspect the whole schema you can either use the `.schema` command in a standard SQLite session or use a GUI such as [Beekeeper Studio]. You'll notice that there are no explicit foreign key contraints so you'll have to work out which fields link to which tables. Field naming is fairly consistent so it should be a reasonable effort.


<div class="erd diagram">
  <svg width="100%" viewBox="0.00 0.00 1169.00 449.50" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <g id="graph0" class="graph" transform="scale(1 1) rotate(0) translate(4 445.5)">
  <polygon fill="white" stroke="transparent" points="-4,4 -4,-445.5 1165,-445.5 1165,4 -4,4"/>
  <!-- Adobe_AdditionalMetadata -->
  <g id="node1" class="node">
  <title>Adobe_AdditionalMetadata</title>
  <polygon fill="none" stroke="black" points="8,-262 8,-290 226,-290 226,-262 8,-262"/>
  <text text-anchor="start" x="13" y="-273.2" font-family="Helvetica,sans-Serif" font-weight="bold" font-size="16.00">Adobe_AdditionalMetadata</text>
  <polygon fill="none" stroke="black" points="8,-237 8,-262 226,-262 226,-237 8,-237"/>
  <text text-anchor="start" x="13" y="-246.8" font-family="Helvetica,sans-Serif" text-decoration="underline" font-size="14.00">id_local</text>
  <polygon fill="none" stroke="black" points="8,-212 8,-237 226,-237 226,-212 8,-212"/>
  <text text-anchor="start" x="13" y="-221.8" font-family="Helvetica,sans-Serif" font-style="italic" font-size="14.00">image</text>
  </g>
  <!-- Adobe_images -->
  <g id="node3" class="node">
  <title>Adobe_images</title>
  <polygon fill="none" stroke="black" points="330,-210 330,-238 455,-238 455,-210 330,-210"/>
  <text text-anchor="start" x="335" y="-221.2" font-family="Helvetica,sans-Serif" font-weight="bold" font-size="16.00">Adobe_images</text>
  <polygon fill="none" stroke="black" points="330,-185 330,-210 455,-210 455,-185 330,-185"/>
  <text text-anchor="start" x="335" y="-194.8" font-family="Helvetica,sans-Serif" text-decoration="underline" font-size="14.00">id_local</text>
  <polygon fill="none" stroke="black" points="330,-160 330,-185 455,-185 455,-160 330,-160"/>
  <text text-anchor="start" x="335" y="-169.8" font-family="Helvetica,sans-Serif" font-style="italic" font-size="14.00">rootFile</text>
  </g>
  <!-- Adobe_AdditionalMetadata&#45;&#45;Adobe_images -->
  <g id="edge1" class="edge">
  <title>Adobe_AdditionalMetadata--Adobe_images</title>
  <path fill="none" stroke="#7f7f7f" stroke-dasharray="5,2" d="M234.17,-228.87C263.78,-223.23 294.69,-217.35 321.16,-212.3"/>
  <text text-anchor="start" x="314.16" y="-201.1" font-family="Times,serif" font-size="14.00">1</text>
  <text text-anchor="start" x="234.17" y="-217.67" font-family="Times,serif" font-size="14.00">1</text>
  </g>
  <!-- AgLibraryKeywordImage -->
  <g id="node2" class="node">
  <title>AgLibraryKeywordImage</title>
  <polygon fill="none" stroke="black" points="17,-391 17,-419 218,-419 218,-391 17,-391"/>
  <text text-anchor="start" x="22" y="-402.2" font-family="Helvetica,sans-Serif" font-weight="bold" font-size="16.00">AgLibraryKeywordImage</text>
  <polygon fill="none" stroke="black" points="17,-366 17,-391 218,-391 218,-366 17,-366"/>
  <text text-anchor="start" x="22" y="-375.8" font-family="Helvetica,sans-Serif" text-decoration="underline" font-size="14.00">id_local</text>
  <polygon fill="none" stroke="black" points="17,-341 17,-366 218,-366 218,-341 17,-341"/>
  <text text-anchor="start" x="22" y="-350.8" font-family="Helvetica,sans-Serif" font-style="italic" font-size="14.00">image</text>
  <polygon fill="none" stroke="black" points="17,-316 17,-341 218,-341 218,-316 17,-316"/>
  <text text-anchor="start" x="22" y="-325.8" font-family="Helvetica,sans-Serif" font-style="italic" font-size="14.00">tag</text>
  </g>
  <!-- AgLibraryKeywordImage&#45;&#45;Adobe_images -->
  <g id="edge2" class="edge">
  <title>AgLibraryKeywordImage--Adobe_images</title>
  <path fill="none" stroke="#7f7f7f" stroke-dasharray="5,2" d="M218.25,-312.45C223.6,-309.29 228.88,-306.13 234,-303 265.54,-283.76 299.82,-261.24 328.29,-242.08"/>
  <text text-anchor="start" x="321.29" y="-245.88" font-family="Times,serif" font-size="14.00">1</text>
  <text text-anchor="start" x="193.25" y="-301.25" font-family="Times,serif" font-size="14.00">0..N</text>
  </g>
  <!-- AgLibraryKeyword -->
  <g id="node4" class="node">
  <title>AgLibraryKeyword</title>
  <polygon fill="none" stroke="black" points="315,-391 315,-419 469,-419 469,-391 315,-391"/>
  <text text-anchor="start" x="320" y="-402.2" font-family="Helvetica,sans-Serif" font-weight="bold" font-size="16.00">AgLibraryKeyword</text>
  <polygon fill="none" stroke="black" points="315,-366 315,-391 469,-391 469,-366 315,-366"/>
  <text text-anchor="start" x="320" y="-375.8" font-family="Helvetica,sans-Serif" text-decoration="underline" font-size="14.00">id_local</text>
  <polygon fill="none" stroke="black" points="315,-341 315,-366 469,-366 469,-341 315,-341"/>
  <text text-anchor="start" x="320" y="-349.8" font-family="Helvetica,sans-Serif" font-size="14.00">name</text>
  <polygon fill="none" stroke="black" points="315,-316 315,-341 469,-341 469,-316 315,-316"/>
  <text text-anchor="start" x="320" y="-325.8" font-family="Helvetica,sans-Serif" font-style="italic" font-size="14.00">parent</text>
  </g>
  <!-- AgLibraryKeywordImage&#45;&#45;AgLibraryKeyword -->
  <g id="edge3" class="edge">
  <title>AgLibraryKeywordImage--AgLibraryKeyword</title>
  <path fill="none" stroke="#7f7f7f" stroke-dasharray="5,2" d="M225.5,-368C252.51,-368 281.11,-368 306.79,-368"/>
  <text text-anchor="start" x="299.79" y="-356.8" font-family="Times,serif" font-size="14.00">1</text>
  <text text-anchor="start" x="225.5" y="-356.8" font-family="Times,serif" font-size="14.00">0..N</text>
  </g>
  <!-- AgLibraryFile -->
  <g id="node7" class="node">
  <title>AgLibraryFile</title>
  <polygon fill="none" stroke="black" points="558.5,-210 558.5,-238 671.5,-238 671.5,-210 558.5,-210"/>
  <text text-anchor="start" x="563.5" y="-221.2" font-family="Helvetica,sans-Serif" font-weight="bold" font-size="16.00">AgLibraryFile</text>
  <polygon fill="none" stroke="black" points="558.5,-185 558.5,-210 671.5,-210 671.5,-185 558.5,-185"/>
  <text text-anchor="start" x="563.5" y="-194.8" font-family="Helvetica,sans-Serif" text-decoration="underline" font-size="14.00">id_local</text>
  <polygon fill="none" stroke="black" points="558.5,-160 558.5,-185 671.5,-185 671.5,-160 558.5,-160"/>
  <text text-anchor="start" x="563.5" y="-169.8" font-family="Helvetica,sans-Serif" font-style="italic" font-size="14.00">folder</text>
  </g>
  <!-- Adobe_images&#45;&#45;AgLibraryFile -->
  <g id="edge4" class="edge">
  <title>Adobe_images--AgLibraryFile</title>
  <path fill="none" stroke="#7f7f7f" stroke-dasharray="5,2" d="M462.77,-199C490.65,-199 522.55,-199 549.8,-199"/>
  <text text-anchor="start" x="542.8" y="-187.8" font-family="Times,serif" font-size="14.00">1</text>
  <text text-anchor="start" x="462.77" y="-187.8" font-family="Times,serif" font-size="14.00">1</text>
  </g>
  <!-- AgLibraryKeyword&#45;&#45;AgLibraryKeyword -->
  <g id="edge5" class="edge">
  <title>AgLibraryKeyword--AgLibraryKeyword</title>
  <path fill="none" stroke="#7f7f7f" stroke-dasharray="5,2" d="M370.65,-423.77C373.28,-434.17 380.4,-441.5 392,-441.5 403.6,-441.5 410.72,-434.17 413.35,-423.77"/>
  <text text-anchor="start" x="406.35" y="-427.57" font-family="Times,serif" font-size="14.00">1</text>
  <text text-anchor="start" x="345.65" y="-427.57" font-family="Times,serif" font-size="14.00">0..N</text>
  </g>
  <!-- AgLibraryRootFolder -->
  <g id="node5" class="node">
  <title>AgLibraryRootFolder</title>
  <polygon fill="none" stroke="black" points="983,-197 983,-225 1153,-225 1153,-197 983,-197"/>
  <text text-anchor="start" x="988" y="-208.2" font-family="Helvetica,sans-Serif" font-weight="bold" font-size="16.00">AgLibraryRootFolder</text>
  <polygon fill="none" stroke="black" points="983,-172 983,-197 1153,-197 1153,-172 983,-172"/>
  <text text-anchor="start" x="988" y="-181.8" font-family="Helvetica,sans-Serif" text-decoration="underline" font-size="14.00">id_local</text>
  </g>
  <!-- AgLibraryFolder -->
  <g id="node6" class="node">
  <title>AgLibraryFolder</title>
  <polygon fill="none" stroke="black" points="760,-210 760,-238 894,-238 894,-210 760,-210"/>
  <text text-anchor="start" x="765" y="-221.2" font-family="Helvetica,sans-Serif" font-weight="bold" font-size="16.00">AgLibraryFolder</text>
  <polygon fill="none" stroke="black" points="760,-185 760,-210 894,-210 894,-185 760,-185"/>
  <text text-anchor="start" x="765" y="-194.8" font-family="Helvetica,sans-Serif" text-decoration="underline" font-size="14.00">id_local</text>
  <polygon fill="none" stroke="black" points="760,-160 760,-185 894,-185 894,-160 760,-160"/>
  <text text-anchor="start" x="765" y="-169.8" font-family="Helvetica,sans-Serif" font-style="italic" font-size="14.00">rootFolder</text>
  </g>
  <!-- AgLibraryFolder&#45;&#45;AgLibraryRootFolder -->
  <g id="edge6" class="edge">
  <title>AgLibraryFolder--AgLibraryRootFolder</title>
  <path fill="none" stroke="#7f7f7f" stroke-dasharray="5,2" d="M902.31,-199C925.19,-199 950.67,-199 974.62,-199"/>
  <text text-anchor="start" x="967.62" y="-187.8" font-family="Times,serif" font-size="14.00">1</text>
  <text text-anchor="start" x="902.31" y="-187.8" font-family="Times,serif" font-size="14.00">1</text>
  </g>
  <!-- AgLibraryFile&#45;&#45;AgLibraryFolder -->
  <g id="edge7" class="edge">
  <title>AgLibraryFile--AgLibraryFolder</title>
  <path fill="none" stroke="#7f7f7f" stroke-dasharray="5,2" d="M679.23,-199C702.1,-199 728.08,-199 751.77,-199"/>
  <text text-anchor="start" x="744.77" y="-187.8" font-family="Times,serif" font-size="14.00">1</text>
  <text text-anchor="start" x="679.23" y="-187.8" font-family="Times,serif" font-size="14.00">1</text>
  </g>
  <!-- AgHarvestedExifMetadata -->
  <g id="node8" class="node">
  <title>AgHarvestedExifMetadata</title>
  <polygon fill="none" stroke="black" points="13,-54 13,-82 222,-82 222,-54 13,-54"/>
  <text text-anchor="start" x="18" y="-65.2" font-family="Helvetica,sans-Serif" font-weight="bold" font-size="16.00">AgHarvestedExifMetadata</text>
  <polygon fill="none" stroke="black" points="13,-29 13,-54 222,-54 222,-29 13,-29"/>
  <text text-anchor="start" x="18" y="-38.8" font-family="Helvetica,sans-Serif" text-decoration="underline" font-size="14.00">id_local</text>
  <polygon fill="none" stroke="black" points="13,-4 13,-29 222,-29 222,-4 13,-4"/>
  <text text-anchor="start" x="18" y="-13.8" font-family="Helvetica,sans-Serif" font-style="italic" font-size="14.00">image</text>
  </g>
  <!-- AgHarvestedExifMetadata&#45;&#45;Adobe_images -->
  <g id="edge8" class="edge">
  <title>AgHarvestedExifMetadata--Adobe_images</title>
  <path fill="none" stroke="#7f7f7f" stroke-dasharray="5,2" d="M216.95,-86.02C222.77,-88.96 228.49,-91.97 234,-95 267.08,-113.21 302.27,-136.16 330.93,-155.86"/>
  <text text-anchor="start" x="323.93" y="-144.66" font-family="Times,serif" font-size="14.00">1</text>
  <text text-anchor="start" x="209.95" y="-89.82" font-family="Times,serif" font-size="14.00">1</text>
  </g>
  <!-- AgHarvestedIptcMetadata -->
  <g id="node9" class="node">
  <title>AgHarvestedIptcMetadata</title>
  <polygon fill="none" stroke="black" points="13,-158 13,-186 222,-186 222,-158 13,-158"/>
  <text text-anchor="start" x="18" y="-169.2" font-family="Helvetica,sans-Serif" font-weight="bold" font-size="16.00">AgHarvestedIptcMetadata</text>
  <polygon fill="none" stroke="black" points="13,-133 13,-158 222,-158 222,-133 13,-133"/>
  <text text-anchor="start" x="18" y="-142.8" font-family="Helvetica,sans-Serif" text-decoration="underline" font-size="14.00">id_local</text>
  <polygon fill="none" stroke="black" points="13,-108 13,-133 222,-133 222,-108 13,-108"/>
  <text text-anchor="start" x="18" y="-117.8" font-family="Helvetica,sans-Serif" font-style="italic" font-size="14.00">image</text>
  </g>
  <!-- AgHarvestedIptcMetadata&#45;&#45;Adobe_images -->
  <g id="edge9" class="edge">
  <title>AgHarvestedIptcMetadata--Adobe_images</title>
  <path fill="none" stroke="#7f7f7f" stroke-dasharray="5,2" d="M229.83,-168.3C260.75,-174.19 293.42,-180.41 321.2,-185.71"/>
  <text text-anchor="start" x="314.2" y="-174.51" font-family="Times,serif" font-size="14.00">1</text>
  <text text-anchor="start" x="229.83" y="-157.1" font-family="Times,serif" font-size="14.00">1</text>
  </g>
  </g>
  </svg>
</div>


### Images

The `Adobe_images` is the core of the catalogue. In it you can find information about ratings, colour labels, whether it's a copy or an original, orientation and more.

### Filesystem

There are three tables representing the file structure linking between the images in the catalogue and the source images stored outside Lightroom.

- `AgLibraryRootFolder` has the absolute and relative paths to work out where the images sit in the disk and where they sit in relation to the catalogue.
- `AgLibraryFolder` represents any folder structure existing from the root folder inwards.
- `AgLibraryFile` represents any file found in each known folder. Every image in `Adobe_images` has a file in this table.

### Metadata

Metadata is split in multiple tables by provenance:

- `Adobe_AdditionalMetadata` has a field `xmp` with the whole [XMP] blob.
- `AgHarvestedExifMetadata` has the [Exif] information.
- `AgHarvestedIptcMetadata` has the [IPTC] information.
- `AgHarvestedDNGMetadata` has the [DNG] information.

There are other metadata tables such as `AgLibraryIPTC` but I haven't worked out whether they are more relevant than the ones listed above.

### Keywords

Keywords are normalised across. The main tables are `AgLibraryKeyword`, `AgLibraryKeywordImage` and `AgLibraryKeywordSynonym`.

### Collections

Collections are normalised across. The main tables are `AgLibraryCollection` and `AgLibraryCollectionImage`.

### Imports

Both `AgLibraryImport` and `AgLibraryImportImage` group images to the importing action and the date it happened.


## Querying the catalogue

With an acquaintance of the schema we can start pulling some information out of the catalogue.

The following query lists every image with their respective filesystem path, rating, colour label and details around how the photo was taken.

```sql
SELECT
  root_folder.name AS root_folder,
  folder.pathFromRoot AS relative_path,
  file.baseName AS file_basename,
  file.extension AS file_extension,

  COALESCE(image.rating, 0) AS rating,
  image.colorLabels AS colour_label,

  image.captureTime as capture_time,
  exif.focalLength AS focal_length,
  ROUND(exif.aperture, 3) AS aperture,
  exif.shutterSpeed AS shutter_speed,
  ROUND(exif.isoSpeedRating, 0) AS iso_speed_rating,
  camera_model.value AS camera,
  lens.value AS lens

FROM
  AgLibraryFile AS file
LEFT JOIN AgLibraryFolder AS folder
  ON folder.id_local = file.folder
LEFT JOIN AgLibraryRootFolder AS root_folder
  ON root_folder.id_local = folder.rootFolder
LEFT JOIN Adobe_images AS image
  ON file.id_local = image.rootFile
LEFT JOIN AgHarvestedExifMetadata AS exif
  ON exif.image = image.id_local
LEFT JOIN AgInternedExifCameraModel AS camera_model
  ON camera_model.id_local = metadata.cameraModelRef
LEFT JOIN AgInternedExifLens AS lens
  ON lens.id_local = metadata.lensRef
```

This next query lists the images with their filesystem path, height, width and the full XMP blob.

```sql
SELECT
  root_folder.absolutePath || folder.pathFromRoot || file.baseName || '.' || file.extension AS path,
  image.fileHeight AS height,
  image.fileWidth AS width,
  metadata.xmp
FROM
  Adobe_images AS image
JOIN AgLibraryFile AS file
  ON image.rootFile = file.id_local
JOIN AgLibraryFolder AS folder
  ON file.folder = folder.id_local
JOIN AgLibraryRootFolder AS root_folder
  ON folder.rootFolder = root_folder.id_local
JOIN Adobe_AdditionalMetadata metadata
  ON metadata.image = image.id_local
```


## Timestamps

Timestamps deserve their own section because Lightroom uses different formats depending on the case and not necessarily one you would expect. For example, some values are [ISO8601] datetimes, whereas others are large integers looking like a [Unix epoch].

These large integers don't have the conventional Unix epoch starting at `1970-01-01T00:00:00Z` though, they start at `2001-01-01T00:00:00Z`. Thus the corresponding Unix time is `978307200`.

**Note**: At least this is the case in MacOS and seems to boil down to the [Cocoa Core Data Timestamp](https://www.epochconverter.com/coredata).


With this in mind, to get the creation time in UTC from a virtual copy of an image you'll need to convert values from existing copies to the Unix Epoch and the other ones either filter them out or reset to `0` (i.e. `1970-01-01T00:00:00Z`):

```sql
SELECT
  id_local,
  copyName,
  strftime('%Y-%m-%dT%H:%M:%SZ', 
    CASE
      WHEN copyName IS NULL THEN
        copyCreationTime - 63113817600
      ELSE
        copyCreationTime + 978307200
    END, 'unixepoch')
  AS copy_creation_time,

FROM
  Adobe_images AS image

ORDER BY
  timestamp DESC
```


## Thumbnails

There are two types of thumbnail: the `root-pixels.db` database holds small JPEG blobs whilst the `previews.db` database holds references to the [image pyramid] files (`.lrprev`).

A quick way to see a thumbnail from the `root-pixels.db` is as follows:

```sh
sqlite3 squirrel.db "SELECT quote(jpegData) FROM RootPixels LIMIT 1" | xxd -r -p | icat --scale-up
```

We extract the JPEG blob as a hexadecimal string, convert it back to binary with `xxd` and display it with [Kitty]'s `icat`.


The `previews.db` holds information about the `.lrprev` files and their original images. Using the main tables you can get a good view of what's available:

```sql
SELECT
  ImageCacheEntry.imageId AS image_id,
  ImageCacheEntry.orientation,
  Pyramid.uuid,
  Pyramid.digest,
  Pyramid.colorProfile AS color_profile,
  Pyramid.croppedWidth AS width,
  Pyramid.croppedHeight AS height
FROM
  Pyramid
JOIN ImageCacheEntry
  ON ImageCacheEntry.uuid = Pyramid.uuid
```


## Detour: the `.lrprev` file

A `.lrprev` file is a binary file containing the full [image pyramid] generated by Lightroom. In short, the binary layout excluding paddings looks like:

```
<signature = AgHg> <size> <label = "header">
<data>
<signature = AgHg> <size> <label = "level_1">
<data>
…
<signature = AgHg> <size> <label = "level_4">
<data>
…
EOF
```

In other words, the file starts with a four byte signature `AgHg` (`0x41 0x67 0x48 0x67`), followed with the size (541 bytes in this example) and then the label of the block ( `header`):

```
┌────────┬─────────────────────────┬─────────────────────────┬────────┬────────┐
│00000000│ 41 67 48 67 00 20 00 00 ┊ 00 00 00 00 00 00 02 47 │AgHg0 00┊000000•G│
│00000010│ 00 00 00 00 00 00 00 09 ┊ 68 65 61 64 65 72 00 00 │0000000_┊header00│
└────────┴─────────────────────────┴─────────────────────────┴────────┴────────┘
```

After that comes the actual header which is a key/value structure parseable as a [Lua](https://www.lua.org/) table:

```lua
pyramid = {
	colorProfile = "AdobeRGB",
	croppedHeight = 4912,
	croppedWidth = 7360,
	digest = "030b36e11e9d722fdab20884884e0ff2",
	fileTimeStamp = 645111123,
	formatVersion = 3,
	fromProxy = false,
	levels = {
		{
			height = 61,
			width = 90,
		},
		{
			height = 121,
			width = 180,
		},
		{
			height = 241,
			width = 360,
		},
		{
			height = 481,
			width = 720,
		},
		{
			height = 961,
			width = 1440,
		},
		{
			height = 1922,
			width = 2880,
		},
	},
	quality = "standard",
	uuid = "FF4ADF67-3C63-4EB7-85B1-6D4409B537D3",
}
```

From the header data we know this file has 7 _pyramid levels_ which means the rest of the file is expected to have 7 more blocks labelled from `level_1` to `level_7` where each data block is a fully functional JPEG of the described width and height. I haven't checked but level 1 looks exactly the same as the small thumbnail found in `root-pixels.db`.

**Note**: The `uuid` and `digest` are also part of the filename which has a pattern such as `{uuid}-{digest}.lrprev`. This information also allows joining the dots with the `previews.db` tables `Pyramid`, `PyramidLevel` and `ImageCacheEntry` which in turn link to the main catalogue `Adobe_images` table.


After the header, a new block starts with the same signature `AgHg`, followed by the size and label of the block (`level_1`), then the data of _size_ bytes and then it repeats for as many levels as the pyramid has.


## Closing thoughts

It's fair to say that proprietary undocumented formats are not my favourite topic. That said, the fact that Lightroom uses SQLite and keeps things roughtly consistent softens the problem of having data held hostage by businesses. It would be great if Adobe had easy to find documentation for the internals but I recognise they likely don't get any benefit from doing so.

I'm not entirely sure whether Lightroom Classic is here to stay or not but if it is it might be worth it learning how to write a plug-in for it. A quick search in Adobe's website yields no useful getting started tutorials which is a bit of a shame.



[SQLite]: https://sqlite.org/
[FTS5]: https://www.sqlite.org/fts5.html
[Beekeeper Studio]: https://github.com/beekeeper-studio/beekeeper-studio/
[XMP]: https://en.wikipedia.org/wiki/Extensible_Metadata_Platform
[Exif]: https://en.wikipedia.org/wiki/Exif
[IPTC]: https://en.wikipedia.org/wiki/International_Press_Telecommunications_Council
[DNG]: https://en.wikipedia.org/wiki/Digital_Negative
[ISO8601]: https://en.wikipedia.org/wiki/ISO_8601
[Unix epoch]: https://en.wikipedia.org/wiki/Unix_time
[image pyramid]: https://en.wikipedia.org/wiki/Pyramid_%28image_processing%29
[Kitty]: https://sw.kovidgoyal.net/kitty/
