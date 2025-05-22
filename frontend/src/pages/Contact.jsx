// src/pages/Contact.jsx
import React from 'react';
import '../styles/Contact.css';

export default function Contact() {
    const teamMembers = [
        {
            name: 'Md. Ashraful Islam',
            role: 'Frontend Developer',
            email: 'ashrafasif63@gmail.com',
            github: 'https://github.com/asif63',
            image: '/me.jpg'
        },
        {
            name: 'Md. Mizbah Uddin',
            role: 'Backend Developer',
            email: 'mdmizbah2002@gmail.com',
            github: 'https://github.com/member2',
            image: '/Mizbah Vai.jpg'
        },
        {
            name: 'Robin Dey',
            role: 'Database Engineer',
            email: 'robindey12052@gmail.com',
            github: 'https://github.com/member3',
            image: '/Robin Da.jpg'
        }
    ];

    return (
        <div className="contact-page">
            {/* Animated coding background */}
            <div className="code-background"></div> 

            <h1>Meet Our Team</h1>
            <p className="subtitle">The minds behind Codemate</p>

            <div className="team-grid">
                {teamMembers.map((member, index) => (
                    <div key={index} className="team-card">
                        <img src={member.image} alt={member.name} className="team-photo" />
                        <h2>{member.name}</h2>
                        <p className="role">{member.role}</p>
                        <p className="email">{member.email}</p>
                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="github-link">
                            GitHub Profile
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
