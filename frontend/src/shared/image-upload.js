import React, { useRef, useState, useEffect } from 'react';

import './image-upload.css';

const ImageUpload = (props) => {
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new global.FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const imageUploaderRef = useRef();

  const afterUploadHandler = (event) => {
    let pickedFile;
    let fileIsValid = isValid;

    if (event.target.files && event.target.files.length === 1) {
      [pickedFile] = event.target.files;
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    props.onInput({ id: props.id, file: pickedFile, isValid: fileIsValid });
  };

  const uploadImageHandler = () => {
    imageUploaderRef.current.click();
  };

  return (
    <div>
      <input
        id={props.id}
        ref={imageUploaderRef}
        style={{ display: 'none' }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={afterUploadHandler}
      />
      <div className={`image-upload ${props.center && 'center'}`}>
        <div className="image-upload__preview">
          {previewUrl && <img src={previewUrl} alt="Preview" />}
          {!previewUrl && props.value && <img src={props.value} alt="Upload" />}
          {!previewUrl && !props.value && (
            <img src={props.defImgSrc} alt="Default" />
          )}
        </div>
        <button type="button" onClick={uploadImageHandler}>
          Choose File
        </button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;
