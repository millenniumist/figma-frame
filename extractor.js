import fetch from "node-fetch";

export async function extractFigmaData({ fileId, ids, token, fileName }) {
  try {
    fileName = fileName.replace(" ", "-");

    const response = await fetch(`https://api.figma.com/v1/files/${fileId}/nodes?ids=${ids}`, {
      headers: {
        "X-Figma-Token": token,
      },
    });
    const responseData = await response.json();
    console.log("Figma API response:", responseData);

    const nodeId = ids.replace("-", ":");
    const data = [responseData.nodes[nodeId].document];
    console.log("**********", data);

    function getAllFrames(items) {
      let frames = [];
      for (const item of items) {
        if (item.type === "FRAME") {
          frames.push(item);
          if (item.children) {
            frames = frames.concat(getAllFrames(item.children));
          }
        } else if (item.children) {
          frames = frames.concat(getAllFrames(item.children));
        }
      }
      return frames;
    }

    let allFrames = getAllFrames(data);
    let mobileFrames = allFrames.filter(
      (frame) =>
        frame.absoluteBoundingBox &&
        frame.absoluteBoundingBox.width >= 320 &&
        frame.absoluteBoundingBox.width <= 480 &&
        frame.absoluteBoundingBox.height >= 568 &&
        frame.absoluteBoundingBox.height <= 1000
    );

    const extractedData = mobileFrames.map((frame) => ({
      id: `https://www.figma.com/design/${fileId}/${fileName}?node-id=${frame.id.replace(
        ":",
        "-"
      )}`,
      name: frame.name,
      width: frame.absoluteBoundingBox.width,
      height: frame.absoluteBoundingBox.height,
    }));

    const csvHeader = "id,name,width,height\n";
    const csvContent = extractedData
      .map((item) => `${item.id},${item.name},${item.width},${item.height}`)
      .join("\n");

    // Return response with properly encoded CSV data
    return new Response(new TextEncoder().encode(csvHeader + csvContent), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}.csv"`,
      },
    });
  } catch (error) {
    console.error("Extraction error details:", error);
    throw new Error(`Failed to process Figma data: ${error.message}`);
  }
}
