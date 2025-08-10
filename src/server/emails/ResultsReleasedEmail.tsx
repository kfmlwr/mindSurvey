import * as React from "react";

interface ResultsReleasedEmailTemplateProps {
  teamName: string;
  teamOwnerName: string;
  url: string;
}

export const ResultsReleasedEmailTemplate: React.FC<
  ResultsReleasedEmailTemplateProps
> = ({ teamName, teamOwnerName, url }) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
      <h1 style={{ color: '#333', fontSize: '24px', marginBottom: '16px' }}>
        🎉 Team Survey Results Available - {teamName}
      </h1>
      
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
        Hello {teamOwnerName}!
      </p>
      
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
        Great news! The survey results for your team <strong>{teamName}</strong> have been reviewed and are now available for viewing.
      </p>
      
      <div style={{ 
        backgroundColor: '#d4edda', 
        border: '1px solid #c3e6cb', 
        borderRadius: '4px', 
        padding: '12px', 
        marginBottom: '20px' 
      }}>
        <p style={{ color: '#155724', margin: '0', fontSize: '14px' }}>
          ✅ Your team's survey has been completed and results are ready to review
        </p>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a 
          href={url} 
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}
        >
          View Team Results
        </a>
      </div>
      
      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
        You can now access your team's complete survey analysis, including individual and team-wide insights.
      </p>
      
      <p style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
        If you're having trouble with the button above, copy and paste this URL into your browser:
      </p>
      <p style={{ color: '#666', fontSize: '12px', textAlign: 'center', wordBreak: 'break-all' }}>
        {url}
      </p>
      
      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />
      
      <p style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
        This is an automated notification. Please do not reply to this email.
      </p>
    </div>
  </div>
);