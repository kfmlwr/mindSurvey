import * as React from "react";

interface ReminderEmailTemplateProps {
  teamName: string;
  url: string;
  daysRemaining: number;
}

export const ReminderEmailTemplate: React.FC<
  ReminderEmailTemplateProps
> = ({ teamName, url, daysRemaining }) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
      <h1 style={{ color: '#333', fontSize: '24px', marginBottom: '16px' }}>
        🔔 Survey Reminder - Team {teamName}
      </h1>
      
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
        Hello! This is a friendly reminder that you haven't completed your team survey yet.
      </p>
      
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
        Your team <strong>{teamName}</strong> is waiting for your input to complete the assessment.
      </p>
      
      <div style={{ 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffeaa7', 
        borderRadius: '4px', 
        padding: '12px', 
        marginBottom: '20px' 
      }}>
        <p style={{ color: '#856404', margin: '0', fontSize: '14px' }}>
          ⏰ Time remaining: {daysRemaining} days until invitation expires
        </p>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a 
          href={url} 
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}
        >
          Complete Survey Now
        </a>
      </div>
      
      <p style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
        If you're having trouble with the button above, copy and paste this URL into your browser:
      </p>
      <p style={{ color: '#666', fontSize: '12px', textAlign: 'center', wordBreak: 'break-all' }}>
        {url}
      </p>
      
      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
      
      <p style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
        This is an automated reminder. Please do not reply to this email.
      </p>
    </div>
  </div>
);