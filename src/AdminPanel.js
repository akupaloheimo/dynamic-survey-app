function AdminPanel() {
  const exportAllResponses = async () => {
    const querySnapshot = await getDocs(collection(db, "survey-responses"));
    const responses = [];

    querySnapshot.forEach((doc) => {
      responses.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Export as CSV or JSON
    const csv = convertToCSV(responses);
    downloadFile(csv, "survey-responses.csv");
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <button onClick={exportAllResponses}>Export All Responses</button>
    </div>
  );
}
export default AdminPanel;
