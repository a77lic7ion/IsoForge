import type { Asset } from '../types';

declare const JSZip: any;

const createGodotImportFile = (): string => {
    return `[remap]

importer="texture"
type="Texture2D"
path="res://.godot/imported/image.png-hash.ctex"
metadata={
"vram_texture": false
}

[deps]

source_file="res://image.png"
dest_files=["res://.godot/imported/image.png-hash.ctex"]

[params]

compress/mode=0
compress/lossy_quality=0.7
compress/hdr_compression=1
compress/normal_map=0
compress/channel_pack=0
mipmaps/generate=false
mipmaps/limit=-1
roughness/map_mode=0
roughness/src_normal=""
process/fix_alpha_border=true
process/premultiply_alpha=false
process/normal_map_invert_y=false
process/hdr_as_srgb=false
process/hdr_clamp_exposure=false
process/size_limit=0
detect_3d/compress_to=0
`;
};


// Creates a Godot .tscn file content for a Sprite3D node.
const createGodotScene3D = (assetName: string, texturePath: string): string => {
    return `[gd_scene load_steps=3 format=3]

[ext_resource type="Texture2D" path="${texturePath}" id="1_dgwqp"]

[sub_resource type="StandardMaterial3D" id="StandardMaterial3D_o3v8g"]
albedo_texture = ExtResource("1_dgwqp")
texture_filter = 0
shading_mode = 0
specular_mode = 2
albedo_color = Color(1, 1, 1, 1)
disable_ambient_light = true

[node name="${assetName}" type="Sprite3D"]
material_override = SubResource("StandardMaterial3D_o3v8g")
texture = ExtResource("1_dgwqp")
`;
};

const createGodotSpriteSheetScene2D = (assetName: string, texturePath: string, columns: number, rows: number): string => {
    return `[gd_scene load_steps=2 format=3]

[ext_resource type="Texture2D" path="${texturePath}" id="1_abcde"]

[node name="${assetName}" type="Sprite2D"]
texture = ExtResource("1_abcde")
hframes = ${columns}
vframes = ${rows}
`;
}

const triggerZipDownload = (zip: any, filename: string) => {
    zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    });
};

export const exportToGodotProject = async (assets: Asset[]) => {
    if (assets.length === 0) {
        alert("No assets selected for export.");
        return;
    }

    const zip = new JSZip();
    const importContent = createGodotImportFile();

    for (const asset of assets) {
        const assetName = asset.prompt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40) || 'iso_asset';
        const pngFilename = `${assetName}.png`;
        const tscnFilename = `${assetName}.tscn`;
        const importFilename = `${pngFilename}.import`;
        
        const texturePath = `res://${pngFilename}`;
        const sceneContent = createGodotScene3D(assetName, texturePath);

        const imageBlob = await fetch(asset.imageData).then(res => res.blob());

        zip.file(pngFilename, imageBlob);
        zip.file(tscnFilename, sceneContent);
        zip.file(importFilename, importContent);
    }
    
    const zipFilename = assets.length > 1 ? 'IsoForge_Export.zip' : `${assets[0].prompt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40) || 'iso_asset'}.zip`;
    triggerZipDownload(zip, zipFilename);
};


export const exportSpriteSheetForGodot = async (
    canvas: HTMLCanvasElement,
    filename: string,
    columns: number,
    rows: number,
) => {
    const zip = new JSZip();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9]/g, '_') || 'spritesheet';

    const pngFilename = `${cleanFilename}.png`;
    const tscnFilename = `${cleanFilename}.tscn`;
    const importFilename = `${pngFilename}.import`;

    const texturePath = `res://${pngFilename}`;
    const sceneContent = createGodotSpriteSheetScene2D(cleanFilename, texturePath, columns, rows);
    const importContent = createGodotImportFile();

    canvas.toBlob((blob) => {
        if (blob) {
            zip.file(pngFilename, blob);
            zip.file(tscnFilename, sceneContent);
            zip.file(importFilename, importContent);
            triggerZipDownload(zip, `${cleanFilename}.zip`);
        }
    }, 'image/png');
};