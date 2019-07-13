export const currentID = () => {
    const id = window.location.pathname.split('/')[1];
    return id.length > 0 ? id : null;
}

export const currentSecret = () => localStorage.getItem('secret');

export const formatExpiryTime = (expirySeconds: number) => {
    if (expirySeconds < 0) return 'This paste has been deleted!';
    if (expirySeconds < 60) return 'Will be deleted in less than a minute';
    const years = Math.floor(expirySeconds / 31536000);
    const days = Math.floor((expirySeconds % 31536000) / 86400);
    const hours = Math.floor((expirySeconds % 86400) / 3600);
    const minutes = Math.floor((expirySeconds % 3600) / 60);
    let time = "Will be deleted in ";
    if (years !== 0) {
        time += years + (years === 1 ? ' year ' : ' years ');
    }
    if (days !== 0) {
        time += days + (days === 1 ? ' day ' : ' days ');
    }
    if (hours !== 0 && years === 0 && days < 7) {
        time += hours + (hours === 1 ? ' hour ' : ' hours ');
    }
    if (minutes !== 0 && years === 0 && days === 0 && hours < 12) {
        time += minutes + (minutes === 1 ? ' minute ' : ' minutes ');
    }
    return time.substring(0, time.length - 1);
}
