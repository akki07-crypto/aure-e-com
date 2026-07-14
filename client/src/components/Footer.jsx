import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, Globe, Send, MessageCircle } from 'lucide-react';

export const Footer = () => {
  const handleSubmitNewsletter = (e) => {
    e.preventDefault();
    alert('Thank you! You have subscribed to the AURA newsletter.');
    e.target.reset();
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          
          {/* Logo and About */}
          <div className="footer-column">
            <div className="footer-logo-row">
              <Link to="/" className="logo-link" style={{ fontSize: '20px' }}>
                AURA
                <div className="logo-dot"></div>
              </Link>
            </div>
            <p className="footer-about-text">
              High-end, premium tech products designed with absolute precision. Our vision brings together structural minimalism and top-tier consumer technology.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
              Secure SSL 256-bit encryption
            </div>
          </div>

          {/* Shop Categories */}
          <div className="footer-column">
            <h4>Collections</h4>
            <ul className="footer-links">
              <li><Link to="/">Audio Devices</Link></li>
              <li><Link to="/">Smart Wearables</Link></li>
              <li><Link to="/">Home Technology</Link></li>
              <li><Link to="/">Desk Accessories</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-column">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a href="#shipping">Shipping Policy</a></li>
              <li><a href="#returns">Returns & Exchanges</a></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
              <li><a href="#contact">Contact Support</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-column">
            <h4>Join The Circle</h4>
            <p className="footer-newsletter-text">
              Subscribe to receive private collection launches, architectural product releases, and exclusive member discounts.
            </p>
            <form onSubmit={handleSubmitNewsletter} className="footer-newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email" 
                required 
                className="input-field" 
                style={{ padding: '8px 12px', fontSize: '13px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} AURA Inc. All rights reserved. Made for premium experiences.
          </div>
          <div className="footer-socials">
            <a href="#global" className="footer-social-link" title="Website">
              <Globe size={18} />
            </a>
            <a href="#newsletter" className="footer-social-link" title="Newsletter">
              <Send size={18} />
            </a>
            <a href="#discord" className="footer-social-link" title="Discord">
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
