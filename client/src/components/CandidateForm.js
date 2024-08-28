import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { FaPlus, FaTrash } from 'react-icons/fa';

const CandidateForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [residentialAddress, setResidentialAddress] = useState({
    street1: '',
    street2: '',
  });
  const [permanentAddress, setPermanentAddress] = useState({
    street1: '',
    street2: '',
  });
  const [sameAsResidential, setSameAsResidential] = useState(true);
  const [documents, setDocuments] = useState([{ fileName: '', fileType: '', file: null }]);
  const [errors, setErrors] = useState({});
  const history = useHistory();

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    return file && allowedTypes.includes(file.type);
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateFile(file)) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [`document${index}`]: 'Invalid file type. Only JPEG, PNG, and PDF are allowed.'
        }));
        return;
      }
      const updatedDocuments = [...documents];
      updatedDocuments[index] = {
        fileName: file.name,
        fileType: file.type,
        file: file
      };
      setDocuments(updatedDocuments);
      setErrors(prevErrors => ({
        ...prevErrors,
        [`document${index}`]: ''
      }));
    }
  };

  const handleAddDocument = () => {
    setDocuments([...documents, { fileName: '', fileType: '', file: null }]);
  };

  const handleRemoveDocument = (index) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    setDocuments(updatedDocuments);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!dateOfBirth.trim()) newErrors.dateOfBirth = 'Date of birth is required';
    if (!validateDateOfBirth(dateOfBirth)) newErrors.dateOfBirth = 'You must be at least 18 years old';
    if (!residentialAddress.street1.trim()) newErrors.residentialStreet1 = 'Residential street 1 is required';
    if (!sameAsResidential && !permanentAddress.street1.trim()) newErrors.permanentStreet1 = 'Permanent street 1 is required';

    // Validate documents
    if (documents.length < 2) newErrors.documents = 'At least two documents are required';
    documents.forEach((doc, index) => {
      if (!doc.fileName) newErrors[`document${index}FileName`] = 'File name is required';
      if (!doc.fileType) newErrors[`document${index}FileType`] = 'File type is required';
      if (!doc.file) newErrors[`document${index}File`] = 'File is required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const validateDateOfBirth = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Validation failed:", errors);
      return; // Stop if the form is invalid
    }

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('dateOfBirth', dateOfBirth);
      formData.append('sameAsResidential', sameAsResidential);

      // Append residential address fields
      formData.append('residentialAddress[street1]', residentialAddress.street1);
      formData.append('residentialAddress[street2]', residentialAddress.street2);

      // Append permanent address fields if different from residential
      if (!sameAsResidential) {
        formData.append('permanentAddress[street1]', permanentAddress.street1);
        formData.append('permanentAddress[street2]', permanentAddress.street2);
      }

      // Append files
      documents.forEach((doc) => {
        if (doc.file) {
          formData.append('documents', doc.file);
        }
      });

      const response = await axios.post('/candidate/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        console.log('Candidate added successfully');
        history.push('/success-page'); // Adjust the route as needed
      } else {
        console.error('Successfully added the candidate:', response.data.message);
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
    }
  };

  return (
    <section className="content">
      <div className="container">
        <h2 className="text-center mb-4" style={{ fontSize: '1.5rem' }}>Candidate Form Submission</h2>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="card-body" style={{ padding: '1.5rem' }}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      id="firstName"
                      className="form-control form-control-sm"
                      name="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      id="lastName"
                      className="form-control form-control-sm"
                      name="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="email">Email <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      id="email"
                      className="form-control form-control-sm"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <small className="text-danger">{errors.email}</small>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="dateOfBirth">Date of Birth <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      className="form-control form-control-sm"
                      name="dateOfBirth"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                    {errors.dateOfBirth && <small className="text-danger">{errors.dateOfBirth}</small>}
                  </div>
                </div>
              </div>
              <h3 className="mt-4" style={{ fontSize: '1.2rem' }}>Residential Address</h3>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="residentialStreet1">Street 1 <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      id="residentialStreet1"
                      className="form-control form-control-sm"
                      name="residentialAddress.street1"
                      value={residentialAddress.street1}
                      onChange={(e) => setResidentialAddress({ ...residentialAddress, street1: e.target.value })}
                    />
                    {errors.residentialStreet1 && <small className="text-danger">{errors.residentialStreet1}</small>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label htmlFor="residentialStreet2">Street 2</label>
                    <input
                      type="text"
                      id="residentialStreet2"
                      className="form-control form-control-sm"
                      name="residentialAddress.street2"
                      value={residentialAddress.street2}
                      onChange={(e) => setResidentialAddress({ ...residentialAddress, street2: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group form-check">
                <input
                  type="checkbox"
                  id="sameAsResidential"
                  className="form-check-input"
                  checked={sameAsResidential}
                  onChange={() => setSameAsResidential(!sameAsResidential)}
                />
                <label htmlFor="sameAsResidential" className="form-check-label">Same as Residential Address</label>
              </div>
              {!sameAsResidential && (
                <>
                  <h3 className="mt-4" style={{ fontSize: '1.2rem' }}>Permanent Address</h3>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="permanentStreet1">Street 1 <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          id="permanentStreet1"
                          className="form-control form-control-sm"
                          name="permanentAddress.street1"
                          value={permanentAddress.street1}
                          onChange={(e) => setPermanentAddress({ ...permanentAddress, street1: e.target.value })}
                        />
                        {errors.permanentStreet1 && <small className="text-danger">{errors.permanentStreet1}</small>}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="permanentStreet2">Street 2</label>
                        <input
                          type="text"
                          id="permanentStreet2"
                          className="form-control form-control-sm"
                          name="permanentAddress.street2"
                          value={permanentAddress.street2}
                          onChange={(e) => setPermanentAddress({ ...permanentAddress, street2: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              <h3 className="mt-4" style={{ fontSize: '1.2rem' }}>Documents</h3>
              <div className="documents-section">
                {documents.map((document, index) => (
                  <div key={index} className="document-group" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <div className="form-group" style={{ flex: '2 1 0%', marginRight: '10px' }}>
                      <label htmlFor={`documentFileName${index}`}>File Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        id={`documentFileName${index}`}
                        className="form-control form-control-sm"
                        name={`documentFileName${index}`}
                        value={document.fileName}
                        readOnly
                      />
                      {errors[`document${index}FileName`] && <small className="text-danger">{errors[`document${index}FileName`]}</small>}
                    </div>
                    <div className="form-group" style={{ flex: '2 1 0%', marginRight: '10px' }}>
                      <label htmlFor={`documentFileType${index}`}>File Type <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        id={`documentFileType${index}`}
                        className="form-control form-control-sm"
                        name={`documentFileType${index}`}
                        value={document.fileType}
                        readOnly
                      />
                      {errors[`document${index}FileType`] && <small className="text-danger">{errors[`document${index}FileType`]}</small>}
                    </div>
                    <div className="form-group" style={{ flex: '3 1 0%', marginRight: '10px' }}>
                      <label>Upload File <span className="text-danger">*</span></label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        onChange={(e) => handleFileChange(e, index)}
                      />
                      {errors[`document${index}File`] && <small className="text-danger">{errors[`document${index}File`]}</small>}
                    </div>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      style={{ marginLeft: '10px' }}
                      onClick={() => handleAddDocument()}
                    >
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
                      </svg>
                    </button>
                    {documents.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        style={{ marginLeft: '10px' }}
                        onClick={() => handleRemoveDocument(index)}
                      >
                        <FaTrash /> Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.documents && <small className="text-danger">{errors.documents}</small>}
              <div className="form-group">
                <button type="button" className="btn btn-primary btn-sm" onClick={handleAddDocument}>
                  <FaPlus /> Add Document
                </button>
              </div>
            </div>
            <div className="card-footer text-center">
              <button type="submit" className="btn btn-success">Submit</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default CandidateForm;