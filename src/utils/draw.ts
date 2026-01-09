import { labels_symbol } from "./constants";

export function drawBbox(ctx: CanvasRenderingContext2D, bbox: number[], classId: number) {

    classId = classId + 1;

    // Get the bounding box
    const x1 = Math.floor(bbox[0]);
    const y1 = Math.floor(bbox[1]);
    const x2 = Math.floor(bbox[2]);
    const y2 = Math.floor(bbox[3]);

    const x_len = x2 - x1
    const y_len = y2 - y1
    const square_len = x_len >= y_len ? x_len : y_len;
    const square_x1 = Math.floor(((x1 + x2) / 2) - (square_len / 2))
    const square_y1 = Math.floor(((y1 + y2) / 2) - (square_len / 2))
    const square_x2 = square_x1 + square_len
    const square_y2 = square_y1 + square_len
    const square_y = square_y1 + square_len

    const font_size = Math.floor(square_len / 2)

    // Calculate the width and height of the rectangle
    const width = square_x2 - square_x1;
    const height = square_y2 - square_y1;

    // Draw the first rectangle (white border with 4px thickness)
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'white';
    ctx.strokeRect(square_x1, square_y1, width, height);

    // Draw the second rectangle (black border with 2px thickness inside the white border)
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.strokeRect(square_x1, square_y1, width, height);

    // Add class label (optional)
    if (classId) {
        ctx.font = `${font_size}px KouzanMouhitu`;
        ctx.fillStyle = 'rgb(185, 0, 0)';
        ctx.fillText(labels_symbol[classId], square_x2 - font_size, square_y - (Math.floor(font_size / 4)));
    }
}

export function drawSharingan(ctx: CanvasRenderingContext2D, isSharingan: boolean, eyeImage: HTMLImageElement, centerAxis: number[], radius: number) {
    //console.log(isSharingan)
    if (!ctx || !isSharingan) return;

    const wh = Math.round(radius * 2);
    const axis = centerAxis.map((x) => Math.round(x - radius));
    ctx.drawImage(eyeImage, axis[0], axis[1], wh, wh);
}
