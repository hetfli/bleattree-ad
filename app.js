const socialIcons = {
    github: '💻',
    twitter: '🐦',
    linkedin: '💼',
    instagram: '📷',
    youtube: '📺',
    facebook: '👤',
    twitch: '🎮',
    discord: '💬',
    spotify: '🎵',
    tiktok: '🎬'
};

// Typing animation
let typingQueue = [];
let isTyping = false;

function typeText(element, text, speed = 15) {
    return new Promise((resolve) => {
        let i = 0;
        element.textContent = '';
        element.style.opacity = '1';
        element.classList.add('typing-cursor');

        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                element.classList.remove('typing-cursor');
                resolve();
            }
        }, speed);
    });
}

function fadeInElement(element, delay = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            element.style.transition = 'opacity 0.08s ease';
            element.style.opacity = '1';
            resolve();
        }, delay);
    });
}

async function animatePageLoad() {
    // Fade in avatar immediately
    const avatar = document.getElementById('avatar');
    if (avatar) {
        avatar.style.transition = 'opacity 0.1s ease';
        avatar.classList.add('loaded');
    }

    await new Promise(resolve => setTimeout(resolve, 30));

    // Animate profile elements
    const name = document.getElementById('name');
    const profileInfo = document.getElementById('profile-info');
    const bio = document.getElementById('bio');

    if (name && name.textContent !== 'Loading...') {
        await typeText(name, name.textContent, 3);
    }

    if (profileInfo && profileInfo.style.display !== 'none') {
        await typeText(profileInfo, profileInfo.textContent, 2);
    }

    if (bio && bio.textContent) {
        await typeText(bio, bio.textContent, 1);
    }

    // Animate sections and links
    const sections = document.querySelectorAll('.section-header');
    const links = document.querySelectorAll('.link-item');

    for (const section of sections) {
        section.style.opacity = '1';
        const title = section.querySelector('.section-title');
        const note = section.querySelector('.section-note');

        if (title) {
            await typeText(title, title.textContent, 2);
        }
        if (note) {
            await typeText(note, note.textContent, 1);
        }
    }

    // Fade in links instantly
    for (let i = 0; i < links.length; i++) {
        fadeInElement(links[i], i * 5);
    }
}

function getFaviconUrl(url) {
    try {
        // Handle special cases
        if (url.startsWith('mailto:')) {
            // For email, use Gmail's favicon as a fallback
            return 'https://www.google.com/s2/favicons?domain=gmail.com&sz=16';
        }

        // Extract domain from URL
        const urlObj = new URL(url);
        const domain = urlObj.hostname;

        // Use Google's favicon service with smaller size for pixelated look
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
    } catch (e) {
        // Fallback to a generic icon
        return 'https://www.google.com/s2/favicons?domain=google.com&sz=16';
    }
}

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        const config = await response.json();

        applyTheme(config.theme);
        loadProfile(config.profile);
        loadContent(config);
        loadSocial(config.social);

        document.title = config.profile.name + ' links' || 'links';
    } catch (error) {
        console.error('Error loading config:', error);
        document.getElementById('name').textContent = 'Error loading configuration';
        document.getElementById('bio').textContent = 'Please check your config.json file';
    }
}

function applyTheme(theme) {
    if (!theme) return;

    const root = document.documentElement;
    if (theme.backgroundColor) root.style.setProperty('--bg-color', theme.backgroundColor);
    if (theme.cardColor) root.style.setProperty('--card-color', theme.cardColor);
    if (theme.textColor) root.style.setProperty('--text-color', theme.textColor);
    if (theme.accentColor) root.style.setProperty('--accent-color', theme.accentColor);
    if (theme.linkHoverColor) root.style.setProperty('--link-hover-color', theme.linkHoverColor);
}

function calculateAge(birthday) {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

let currentPhotoIndex = 0;
let profilePhotos = [];

function loadProfile(profile) {
    const avatar = document.getElementById('avatar');
    const name = document.getElementById('name');
    const profileInfo = document.getElementById('profile-info');
    const bio = document.getElementById('bio');
    const prevBtn = document.getElementById('avatar-prev');
    const nextBtn = document.getElementById('avatar-next');

    // Handle photos array or legacy avatar field
    if (profile.photos && profile.photos.length > 0) {
        profilePhotos = profile.photos;
        setProfilePhoto(0);

        // Show/hide navigation buttons
        if (profilePhotos.length > 1) {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        } else {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        }
    } else if (profile.avatar) {
        // Fallback to old avatar field
        profilePhotos = [{ url: profile.avatar, tagline: '' }];
        avatar.src = profile.avatar;
        avatar.alt = `${profile.name || 'Profile'} picture`;
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }

    name.textContent = profile.name || 'Your Name';

    // Build profile info sublines
    const infoItems = [];

    if (profile.othername) {
        infoItems.push(profile.othername);
    }

    if (profile.birthday) {
        const age = calculateAge(profile.birthday);
        infoItems.push(age);
    }

    if (profile.pronouns) {
        infoItems.push(profile.pronouns);
    }

    if (infoItems.length > 0) {
        profileInfo.textContent = infoItems.join(' • ');
        profileInfo.style.display = 'block';
    } else {
        profileInfo.style.display = 'none';
    }

    bio.textContent = profile.bio || '';

    // Set up photo navigation and modal
    setupPhotoNavigation();
}

function setProfilePhoto(index) {
    if (profilePhotos.length === 0) return;

    currentPhotoIndex = index;
    const photo = profilePhotos[index];
    const avatar = document.getElementById('avatar');

    avatar.src = photo.url;
    avatar.alt = photo.tagline || 'Profile picture';
}

function updateModalPhoto() {
    const photo = profilePhotos[currentPhotoIndex];
    const modalImage = document.getElementById('modal-image');
    const modalTagline = document.getElementById('modal-tagline');

    modalImage.src = photo.url;
    modalTagline.textContent = photo.tagline || '';
}

function setupPhotoNavigation() {
    const avatar = document.getElementById('avatar');
    const prevBtn = document.getElementById('avatar-prev');
    const nextBtn = document.getElementById('avatar-next');
    const modal = document.getElementById('photo-modal');
    const modalClose = document.getElementById('modal-close');
    const modalImage = document.getElementById('modal-image');
    const modalTagline = document.getElementById('modal-tagline');
    const modalPrevBtn = document.getElementById('modal-prev');
    const modalNextBtn = document.getElementById('modal-next');

    // Navigate to previous photo
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newIndex = (currentPhotoIndex - 1 + profilePhotos.length) % profilePhotos.length;
        setProfilePhoto(newIndex);
    });

    // Navigate to next photo
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newIndex = (currentPhotoIndex + 1) % profilePhotos.length;
        setProfilePhoto(newIndex);
    });

    // Open modal on avatar click
    avatar.addEventListener('click', () => {
        updateModalPhoto();
        modal.style.display = 'flex';

        // Show/hide modal navigation arrows
        if (profilePhotos.length > 1) {
            modalPrevBtn.style.display = 'flex';
            modalNextBtn.style.display = 'flex';
        } else {
            modalPrevBtn.style.display = 'none';
            modalNextBtn.style.display = 'none';
        }
    });

    // Modal navigation - previous
    modalPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newIndex = (currentPhotoIndex - 1 + profilePhotos.length) % profilePhotos.length;
        setProfilePhoto(newIndex);
        updateModalPhoto();
    });

    // Modal navigation - next
    modalNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const newIndex = (currentPhotoIndex + 1) % profilePhotos.length;
        setProfilePhoto(newIndex);
        updateModalPhoto();
    });

    // Close modal
    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
}

function createLinkElement(link, index) {
    const linkElement = document.createElement('a');
    linkElement.href = link.url;
    linkElement.className = 'link-item';
    linkElement.target = '_blank';
    linkElement.rel = 'noopener noreferrer';

    const iconContainer = document.createElement('span');
    iconContainer.className = 'link-icon';

    // Priority: local image > emoji icon > favicon
    if (link.image) {
        // Use local image
        const img = document.createElement('img');
        img.src = link.image;
        img.alt = '';
        img.className = 'link-favicon';
        img.onerror = function() {
            // Fallback to favicon if local image fails to load
            img.src = getFaviconUrl(link.url);
            img.onerror = function() {
                // Final fallback to emoji if both fail
                iconContainer.textContent = '🔗';
            };
        };
        iconContainer.appendChild(img);
    } else if (link.icon) {
        // Use emoji icon
        iconContainer.textContent = link.icon;
    } else {
        // Use favicon from URL
        const favicon = document.createElement('img');
        favicon.src = getFaviconUrl(link.url);
        favicon.alt = '';
        favicon.className = 'link-favicon';
        favicon.onerror = function() {
            // Fallback to a generic icon emoji if favicon fails to load
            iconContainer.textContent = '🔗';
        };
        iconContainer.appendChild(favicon);
    }

    const title = document.createElement('span');
    title.className = 'link-title';
    title.textContent = link.title;

    const arrow = document.createElement('span');
    arrow.className = 'link-arrow';
    arrow.textContent = '>>';

    linkElement.appendChild(iconContainer);
    linkElement.appendChild(title);
    linkElement.appendChild(arrow);

    return linkElement;
}

function loadContent(config) {
    const container = document.getElementById('links-container');
    container.innerHTML = '';

    let linkIndex = 0;

    // Check for new structure (topLinks + sections) or old structure (links)
    const hasNewStructure = config.topLinks || config.sections;

    if (hasNewStructure) {
        // Render top-level links first
        if (config.topLinks && config.topLinks.length > 0) {
            config.topLinks.forEach(link => {
                const linkElement = createLinkElement(link, linkIndex++);
                container.appendChild(linkElement);
            });
        }

        // Render sections
        if (config.sections && config.sections.length > 0) {
            config.sections.forEach(section => {
                // Create section header
                const sectionHeader = document.createElement('div');
                sectionHeader.className = 'section-header';

                const sectionTitle = document.createElement('h2');
                sectionTitle.className = 'section-title';
                sectionTitle.textContent = section.title;
                sectionHeader.appendChild(sectionTitle);

                if (section.note && section.note.trim() !== '') {
                    const sectionNote = document.createElement('p');
                    sectionNote.className = 'section-note';
                    sectionNote.textContent = section.note;
                    sectionHeader.appendChild(sectionNote);
                }

                container.appendChild(sectionHeader);

                // Render section links
                if (section.links && section.links.length > 0) {
                    section.links.forEach(link => {
                        const linkElement = createLinkElement(link, linkIndex++);
                        container.appendChild(linkElement);
                    });
                }
            });
        }
    } else if (config.links && config.links.length > 0) {
        // Fall back to old structure
        config.links.forEach(link => {
            const linkElement = createLinkElement(link, linkIndex++);
            container.appendChild(linkElement);
        });
    } else {
        container.innerHTML = '<p style="text-align: center; color: #64748b;">No links configured yet</p>';
    }
}

function loadSocial(social) {
    const container = document.getElementById('social-container');
    container.innerHTML = '';

    if (!social || social.length === 0) {
        container.style.display = 'none';
        return;
    }

    social.forEach(link => {
        const socialLink = document.createElement('a');
        socialLink.href = link.url;
        socialLink.className = 'social-link';
        socialLink.target = '_blank';
        socialLink.rel = 'noopener noreferrer';
        socialLink.title = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);

        const favicon = document.createElement('img');
        favicon.src = getFaviconUrl(link.url);
        favicon.alt = link.platform;
        favicon.className = 'social-favicon';
        favicon.onerror = function() {
            // Fallback to emoji if favicon fails to load
            const icon = socialIcons[link.platform.toLowerCase()] || '🔗';
            socialLink.textContent = icon;
        };

        socialLink.appendChild(favicon);
        container.appendChild(socialLink);
    });
}

document.addEventListener('DOMContentLoaded', loadConfig);

// Add click handler for oneko cat
document.addEventListener('DOMContentLoaded', () => {
    // Wait for oneko to be initialized
    const checkForCat = setInterval(() => {
        const onekoCat = document.getElementById('oneko');
        const catSound = document.getElementById('cat-sound');

        if (onekoCat && catSound) {
            clearInterval(checkForCat);

            // Enable pointer events and make clickable
            onekoCat.style.pointerEvents = 'auto';
            onekoCat.style.cursor = 'pointer';

            onekoCat.addEventListener('click', () => {
                catSound.currentTime = 0; // Reset to start
                catSound.play().catch(err => console.log('Audio play failed:', err));
            });
        }
    }, 100);

    // Stop checking after 5 seconds
    setTimeout(() => clearInterval(checkForCat), 5000);
});
