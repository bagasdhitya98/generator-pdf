import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument } from "pdf-lib";
import saveAs from "file-saver";

const App = () => {
  const [fileList, setFileList] = useState([]);
  const fileInputRefs = useRef([]);

  const handleFileUpload = (e) => {
    const files = e.target.files;
    const newFiles = Array.from(files).map((file) => ({
      id: uuidv4(), // Generate unique ID for each file
      name: file.name,
      customName: "",
      content: file,
    }));
    setFileList((prevList) => [...prevList, ...newFiles]);
    resetFileInput();
  };

  const resetFileInput = () => {
    fileInputRefs.current.forEach((ref) => {
      if (ref.current) {
        ref.current.value = "";
      }
    });
  };

  const generatePDF = async (file) => {
    const pdfDoc = await PDFDocument.create();
    const content = await fetch(URL.createObjectURL(file.content)).then((res) =>
      res.arrayBuffer()
    );
    const originalPdf = await PDFDocument.load(content);

    const copiedPages = await pdfDoc.copyPages(
      originalPdf,
      originalPdf.getPageIndices()
    );
    copiedPages.forEach((page) => pdfDoc.addPage(page));

    const pdfBytes = await pdfDoc.save();

    // Save or download the PDF using file-saver
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(pdfBlob, `${file.customName || file.name}.pdf`);
  };

  return (
    <section className="w-screen h-full flex flex-col justify-center items-center relative">
      <div className="w-screen bg-cyan-500 h-40 border flex justify-center items-center rounded-br-full rounded-bl-full fixed top-0">
        <p className="text-white text-2xl font-semibold lg:text-justify md:text-justify sm:text-justify text-center">
          Effortlessly Generate Custom PDFs – Your Document, Your Way!
        </p>
      </div>
      <p className="text-cyan-700 font-semibold text-2xl mt-5 mb-8 lg:text-justify md:text-justify sm:text-justify text-center">
        Nanti upload dulu filenya, baru dirubah namanya terus tinggal download
        deh!
      </p>
      <div className="flex flex-col gap-y-6 mb-16">
        <div className="flex flex-col space-y-2">
          <label>Unggah File: </label>
          <input
            ref={(ref) => (fileInputRefs.current[0] = ref)}
            type="file"
            onChange={handleFileUpload}
            multiple
          />
        </div>
      </div>
      {fileList.map((file, index) => (
        <div
          key={file.id}
          className="absolute p-6 w-full h-16 rounded-md border flex items-center my-60 space-x-2 md:w-max md:my-60 md:space-x-10"
          style={{ top: `${index * 80}px` }}
        >
          <span className="flex-grow truncate">{file.name}</span>
          <input
            className="p-2 bg-white rounded-md border flex-grow md:w-40"
            type="text"
            placeholder="Tulis nama file ..."
            value={file.customName}
            onChange={(e) =>
              setFileList((prevList) =>
                prevList.map((f) =>
                  f.id === file.id ? { ...f, customName: e.target.value } : f
                )
              )
            }
          />
          <button
            className="bg-cyan-300 hover:bg-cyan-500 focus:outline-none border-none text-white"
            onClick={() => generatePDF(file)}
          >
            Generate PDF
          </button>
        </div>
      ))}
    </section>
  );
};

export default App;
