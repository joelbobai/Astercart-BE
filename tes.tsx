import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType } from "docx";

const handleDownloadWord = () => {
  // Example category data
  const categories = [
    { name: "Electronics", sales: 1500, color: "#FF5733" },
    { name: "Clothing", sales: 1200, color: "#33FF57" },
    { name: "Home Goods", sales: 800, color: "#3357FF" },
  ];

  // Create rows for the table
  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Category")] }),
        new TableCell({ children: [new Paragraph("Sales")] }),
        new TableCell({ children: [new Paragraph("Color")] }),
      ],
    }),
    ...categories.map(
      (category) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(category.name)] }),
            new TableCell({ children: [new Paragraph(category.sales.toString())] }),
            new TableCell({ children: [new Paragraph(category.color)] }),
          ],
        })
    ),
  ];

  // Create the Word document
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "Most Sold Categories",
            heading: "Heading1",
          }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  });

  // Generate the Word document and trigger download
  Packer.toBlob(doc).then((blob) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "most_sold_categories.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
