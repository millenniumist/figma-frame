document.getElementById('extractForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileId = document.getElementById('fileId').value;
    const nodeIds = document.getElementById('nodeIds').value;
    const token = document.getElementById('token').value;
    const fileName = document.getElementById('fileName').value;

    try {
        console.log("sending:", fileId, nodeIds, token, fileName);
        const response = await fetch('/api/extract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileId, nodeIds, token, fileName })
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
    } catch (error) {
        document.getElementById('result').textContent = `Error: ${error.message}`;
    }
});
