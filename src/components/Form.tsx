import { FormEvent, useRef } from 'react';
import emailjs from '@emailjs/browser';

const ContactUs = () => {
  const form: any = useRef();

  const sendEmail = (e: FormEvent) => {
    e.preventDefault();

    emailjs
      .sendForm('service_davm0mg', 'template_a0ca4vq', form.current, {
        publicKey: 'k3gmNsbUk0i4n8CN7',
      })
      .then(
        () => {
          console.log('SUCCESS!');
        },
        (error) => {
          console.log('FAILED...', error.text);
        },
      );
  };

  return (
    <form ref={form} onSubmit={sendEmail}>
      <label>Name</label>
      <input type="text" name="user_name" placeholder='Your name'/>
      <label>Email</label>
      <input type="email" name="user_email" placeholder='Your email'/>
      <label>Message</label>
      <textarea name="message" placeholder='Your message'/>
      <input type="submit" value="Send" />
    </form>
  );
};

export default ContactUs