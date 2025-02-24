document.getElementById('extractForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileId = document.getElementById('fileId').value;
    const nodeIds = document.getElementById('nodeIds').value;
    const token = document.getElementById('token').value;
    const fileName = document.getElementById('fileName').value;

    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;

    try {
        console.log("sending:", fileId, nodeIds, token, fileName);
        const response = await fetch('/api/extract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileId, nodeIds, token, fileName })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to extract data');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        // Show success message
        document.getElementById('result').textContent = 'CSV downloaded successfully!';
        document.getElementById('result').style.color = 'green';
        
    } catch (error) {
        document.getElementById('result').textContent = `Error: ${error.message}`;
        document.getElementById('result').style.color = 'red';
    } finally {
        // Reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
});
