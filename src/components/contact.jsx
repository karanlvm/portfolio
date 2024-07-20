import React from 'react';
import './ContactInfo.css';// Import the CSS file

const ContactInfo = () => {
  return (
    <div className="contact-info">
      <h1 className="contact-info__name">Karan Vasudevamurthy</h1>
      <div className="contact-info__details">
        <p className="contact-info__label">kxv4439@mavs.uta.edu</p>
        <p className="contact-info__label">+1 (817) 883-4473</p>
      </div>
    </div>
  );
};

export default ContactInfo;
