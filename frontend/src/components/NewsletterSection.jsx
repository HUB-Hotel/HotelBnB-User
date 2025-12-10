import React from 'react';
import { FiInbox, FiMail } from 'react-icons/fi';
import './style/NewsletterSection.scss';

const NewsletterSection = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // 구독 처리 로직
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <div className="newsletter-content">
          <h3 className="newsletter-title">구독서비스 신청해보세요</h3>
          <p className="newsletter-subtitle">The Travel 구독하고 쿠폰, 최신 이벤트를 받아보세요</p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your email address"
            required
          />
          <button type="submit" className="subscribe-button">Subscribe</button>
        </form>
        <div className="newsletter-illustration">
          <div className="mailbox-wrapper">
            <FiMail className="flying-mail mail-1" />
            <FiMail className="flying-mail mail-2" />
            <FiInbox className="mailbox-icon" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;

