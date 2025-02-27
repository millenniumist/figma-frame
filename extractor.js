import fetch from "node-fetch";

export async function extractFigmaData({ fileId, ids, token, fileName, dimensions }) {
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
        frame.absoluteBoundingBox.width >= dimensions.minWidth &&
        frame.absoluteBoundingBox.width <= dimensions.maxWidth &&
        frame.absoluteBoundingBox.height >= dimensions.minHeight &&
        frame.absoluteBoundingBox.height <= dimensions.maxHeight
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
    const csvData = csvHeader + csvContent;

    return csvData;
  } catch (error) {
    throw new Error(`Error extracting Ids: ${error.message}`);
  }
}
