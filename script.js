/* ============================================================
   FORTUBE - MAIN SCRIPT (v8 - ALL ERRORS FIXED)
   Login: Random email/password works
   Video: Click works properly
   Audio: Works in all browsers
   ============================================================ */

const SUPABASE_URL = "https://eaxstlpltwgpmaupgcwq.supabase.co";
const SUPABASE_KEY = "sb_publishable_sfcTaBDwgGM8ccmMfwP_ig_A6jTZ8w7";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==================== INDEXEDDB ====================
const IDB_NAME = 'fortube_videos_db';
const IDB_STORE = 'videos';
let idbInstance = null;

function openIDB() {
  return new Promise((resolve, reject) => {
    if (idbInstance) return resolve(idbInstance);
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => { idbInstance = e.target.result; resolve(idbInstance); };
    req.onerror = () => reject(req.error);
  });
}

async function saveVideoToIDB(id, blob) {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put({ id, blob, savedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) { return false; }
}

async function getVideoFromIDB(id) {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(id);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) { return null; }
}

async function deleteVideoFromIDB(id) {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) { return false; }
}

// ==================== STATE ====================
const state = {
  loggedIn: false,
  user: null,
  email: '',
  channel: null,
  recentlyWatchedList: [],
  allChannels: [],
  allVideos: [],
  notifications: [],
  subscriptions: [],
  preferences: {
    language: 'English',
    region: 'Global',
    currency: 'USD',
    subtitles: false,
    restricted: false,
    history: true,
    notifications: true,
    quality: 'auto'
  }
};

// ==================== DOM REFS ====================
const $ = id => document.getElementById(id);

const loginGate = $('loginGate');
const gateEmail = $('gateEmail');
const gatePassword = $('gatePassword');
const gateLoginBtn = $('gateLoginBtn');
const hamburgerBtn = $('hamburgerBtn');
const drawer = $('drawer');
const drawerOverlay = $('drawerOverlay');
const drawerUserEmail = $('drawerUserEmail');
const feed = $('feed');
const feedTitle = $('feedTitle');
const emptyFeed = $('emptyFeed');
const searchInput = $('searchInput');
const searchBtn = $('searchBtn');
const micBtn = $('micBtn');
const profilePanel = $('profilePanel');
const profileBackBtn = $('profileBackBtn');
const profileAvatar = $('profileAvatar');
const profileName = $('profileName');
const profileEmail = $('profileEmail');
const channelStatusArea = $('channelStatusArea');
const recentlyWatched = $('recentlyWatched');
const monetizationCard = $('monetizationCard');
const monetizationSubtext = $('monetizationSubtext');
const monetizationPage = $('monetizationPage');
const monetizationBackBtn = $('monetizationBackBtn');
const verifyBtn = $('verifyBtn');
const progressFill = $('progressFill');
const check1 = $('check1'), check2 = $('check2'), check3 = $('check3');
const viewsProgress = $('viewsProgress');
const watchProgress = $('watchProgress');
const subsProgress = $('subsProgress');
const criteriaSub = $('criteriaSub');
const eligibilityCard = $('eligibilityCard');
const monetizationApplyPage = $('monetizationApplyPage');
const monetizationRevenuePage = $('monetizationRevenuePage');
const submitMonetizationApplication = $('submitMonetizationApplication');
const applicationStatus = $('applicationStatus');
const verificationDocument = $('verificationDocument');
const monetizationEmail = $('monetizationEmail');
const totalRevenue = $('totalRevenue');
const qualifiedViewsRevenue = $('qualifiedViewsRevenue');
const withdrawRevenueBtn = $('withdrawRevenueBtn');
const withdrawPage = $('withdrawPage');
const withdrawBackBtn = $('withdrawBackBtn');
const watchPage = $('watchPage');
const watchBackBtn = $('watchBackBtn');
const watchHeaderTitle = $('watchHeaderTitle');
const watchBody = $('watchBody');
const channelViewPage = $('channelViewPage');
const channelViewBackBtn = $('channelViewBackBtn');
const channelViewHeaderTitle = $('channelViewHeaderTitle');
const channelViewBody = $('channelViewBody');
const channelSetupPage = $('channelSetupPage');
const channelSetupBackBtn = $('channelSetupBackBtn');
const setupBanner = $('setupBanner');
const bannerOverlay = $('bannerOverlay');
const setupAvatar = $('setupAvatar');
const setupAvatarEmoji = $('setupAvatarEmoji');
const setupChannelName = $('setupChannelName');
const setupUsername = $('setupUsername');
const setupCategory = $('setupCategory');
const setupLanguage = $('setupLanguage');
const setupCurrency = $('setupCurrency');
const setupRegion = $('setupRegion');
const setupDesc = $('setupDesc');
const channelSetupCancelBtn = $('channelSetupCancelBtn');
const channelSetupCreateBtn = $('channelSetupCreateBtn');
const editChannelPage = $('editChannelPage');
const editChannelBackBtn = $('editChannelBackBtn');
const editBanner = $('editBanner');
const editBannerOverlay = $('editBannerOverlay');
const editAvatar = $('editAvatar');
const editAvatarEmoji = $('editAvatarEmoji');
const editChannelName = $('editChannelName');
const editUsername = $('editUsername');
const editCategory = $('editCategory');
const editLanguage = $('editLanguage');
const editCurrency = $('editCurrency');
const editRegion = $('editRegion');
const editDesc = $('editDesc');
const editChannelCancelBtn = $('editChannelCancelBtn');
const editChannelSaveBtn = $('editChannelSaveBtn');
const settingsPage = $('settingsPage');
const settingsBackBtn = $('settingsBackBtn');
const settingsEmail = $('settingsEmail');
const settingsChannelStatus = $('settingsChannelStatus');
const settingsLanguage = $('settingsLanguage');
const settingsRegion = $('settingsRegion');
const settingsCurrency = $('settingsCurrency');
const settingsQuality = $('settingsQuality');
const toggleSubtitles = $('toggleSubtitles');
const toggleRestricted = $('toggleRestricted');
const toggleHistory = $('toggleHistory');
const toggleNotifications = $('toggleNotifications');
const clearCacheBtn = $('clearCacheBtn');
const termsBtn = $('termsBtn');
const contactBtn = $('contactBtn');
const deleteAccountBtn = $('deleteAccountBtn');
const logoutBtn = $('logoutBtn');
const toast = $('toast');
const navYou = $('navYou');
const navPlus = $('navPlus');
const notifBtn = $('notifBtn');
const settingsBtn = $('settingsBtn');
const notifDot = $('notifDot');
const cameraPanel = $('cameraPanel');
const cameraVideo = $('cameraVideo');
const cameraPlaceholder = $('cameraPlaceholder');
const camClose = $('camClose');
const camFlip = $('camFlip');
const recordBtn = $('recordBtn');
const recordTimer = $('recordTimer');
const longVideoBtn = $('longVideoBtn');
const shortVideoBtn = $('shortVideoBtn');
const galleryBtn = $('galleryBtn');
const galleryBtn2 = $('galleryBtn2');
const nativeGalleryInput = $('nativeGalleryInput');
const thumbnailInput = $('thumbnailInput');
const profilePicInput = $('profilePicInput');
const bannerInput = $('bannerInput');
const uploadDetailsModal = $('uploadDetailsModal');
const uploadPreviewBox = $('uploadPreviewBox');
const uploadPreviewDur = $('uploadPreviewDur');
const uploadTitle = $('uploadTitle');
const uploadCancel = $('uploadCancel');
const uploadNextBtn = $('uploadNextBtn');
const metadataPage = $('metadataPage');
const metadataBackBtn = $('metadataBackBtn');
const thumbnailPicker = $('thumbnailPicker');
const metaTitle = $('metaTitle');
const metaDescription = $('metaDescription');
const metaCategory = $('metaCategory');
const metaTagInput = $('metaTagInput');
const addTagBtn = $('addTagBtn');
const tagsContainer = $('tagsContainer');
const metadataCancelBtn = $('metadataCancelBtn');
const metadataPublishBtn = $('metadataPublishBtn');
const uploadProgressWrap = $('uploadProgressWrap');
const uploadProgressFill = $('uploadProgressFill');
const uploadProgressText = $('uploadProgressText');
const alertPopup = $('alertPopup');
const alertTitle = $('alertTitle');
const alertMessage = $('alertMessage');
const alertCloseBtn = $('alertCloseBtn');
const plusMenu = $('plusMenu');
const plusMenuOverlay = $('plusMenuOverlay');
const plusUploadBtn = $('plusUploadBtn');
const plusShortBtn = $('plusShortBtn');
const plusLiveBtn = $('plusLiveBtn');
const notificationsPage = $('notificationsPage');
const notificationsBackBtn = $('notificationsBackBtn');
const notificationsBody = $('notificationsBody');
const subscriptionsPage = $('subscriptionsPage');
const subsBackBtn = $('subsBackBtn');
const subscriptionsBody = $('subscriptionsBody');

const videoActionsOverlay = $('videoActionsOverlay');
const videoActionsMenu = $('videoActionsMenu');
const vaThumb = $('vaThumb');
const vaTitle = $('vaTitle');
const vaMeta = $('vaMeta');
const vaPrivacySub = $('vaPrivacySub');
const vaEditBtn = $('vaEditBtn');
const vaPrivacyBtn = $('vaPrivacyBtn');
const vaDeleteBtn = $('vaDeleteBtn');

const editVideoPage = $('editVideoPage');
const editVideoBackBtn = $('editVideoBackBtn');
const editVideoThumb = $('editVideoThumb');
const editVideoThumbInput = $('editVideoThumbInput');
const editVideoTitle = $('editVideoTitle');
const editVideoDesc = $('editVideoDesc');
const editVideoCategory = $('editVideoCategory');
const editVideoCancelBtn = $('editVideoCancelBtn');
const editVideoSaveBtn = $('editVideoSaveBtn');

const termsPage = $('termsPage');
const termsBackBtn = $('termsBackBtn');
const supportPage = $('supportPage');
const supportBackBtn = $('supportBackBtn');
const supportBody = $('supportBody');
const supportInput = $('supportInput');
const supportSendBtn = $('supportSendBtn');

let currentEditVideoId = null;
let currentEditThumbnailData = null;

// ==================== HELPERS ====================
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function showAlert(title, message, icon = 'fa-broadcast-tower') {
  if (!alertPopup) return;
  alertTitle.textContent = title;
  alertMessage.innerHTML = message;
  const iconEl = document.getElementById('alertIcon');
  if (iconEl) iconEl.innerHTML = `<i class="fas ${icon}"></i>`;
  alertPopup.classList.add('active');
}

// ============================================================
// AUTO-GENERATE THUMBNAIL
// ============================================================
async function generateThumbnailFromVideo(videoBlob, seekTime = 1) {
  return new Promise((resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const url = URL.createObjectURL(videoBlob);
      video.src = url;

      let done = false;
      const finish = (result, err) => {
        if (done) return;
        done = true;
        URL.revokeObjectURL(url);
        if (err) reject(err);
        else resolve(result);
      };

      video.onloadedmetadata = () => {
        const duration = video.duration;
        const seek = Math.min(seekTime, duration * 0.1) || 0.5;
        video.currentTime = seek;
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          let w = video.videoWidth || 640;
          let h = video.videoHeight || 360;
          const maxDim = 1280;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
            else { w = Math.round(w * maxDim / h); h = maxDim; }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          finish(dataUrl);
        } catch (err) {
          finish(null, err);
        }
      };

      video.onerror = () => finish(null, new Error('Video load failed'));
      setTimeout(() => finish(null, new Error('Thumbnail timeout')), 15000);
    } catch (err) {
      reject(err);
    }
  });
}

// ============================================================
// VIDEO COMPRESSION WITH AUDIO
// ============================================================
async function compressVideo(inputBlob, maxSizeMB = 40) {
  return new Promise(async (resolve) => {
    console.log('🎬 Compression start. Original:', (inputBlob.size / 1024 / 1024).toFixed(1), 'MB');
    
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.playsInline = true;
      video.muted = false;
      video.volume = 1;
      video.crossOrigin = 'anonymous';
      
      const url = URL.createObjectURL(inputBlob);
      video.src = url;

      await new Promise((res, rej) => {
        video.onloadedmetadata = res;
        video.onerror = () => rej(new Error('Cannot read video'));
        setTimeout(() => rej(new Error('Metadata timeout')), 20000);
      });

      const duration = video.duration;

      if (!isFinite(duration) || duration <= 0) {
        URL.revokeObjectURL(url);
        return resolve(inputBlob);
      }

      const targetBytes = maxSizeMB * 1024 * 1024;
      let targetBitrate = Math.floor((targetBytes * 8) / duration);
      targetBitrate = Math.min(targetBitrate, 1500000);
      targetBitrate = Math.max(targetBitrate, 400000);

      const canvas = document.createElement('canvas');
      let w = video.videoWidth || 640;
      let h = video.videoHeight || 480;
      const maxDim = 854;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      const stream = canvas.captureStream(24);

      let audioCtx = null;
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const source = audioCtx.createMediaElementSource(video);
        const dest = audioCtx.createMediaStreamDestination();
        
        source.connect(dest);
        const silentGain = audioCtx.createGain();
        silentGain.gain.value = 0;
        source.connect(silentGain);
        silentGain.connect(audioCtx.destination);

        const audioTracks = dest.stream.getAudioTracks();
        console.log('🔊 Audio tracks captured:', audioTracks.length);

        if (audioTracks.length > 0) {
          audioTracks.forEach(track => stream.addTrack(track));
          console.log('✅ Audio added to stream');
        }
      } catch (e) {
        console.error('❌ Audio capture failed:', e.message);
      }

      let mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp9,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }
      console.log('📦 Mime type:', mimeType);

      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: targetBitrate,
        audioBitsPerSecond: 128000
      });

      const chunks = [];
      recorder.ondataavailable = e => { 
        if (e.data && e.data.size > 0) chunks.push(e.data); 
      };

      const finish = () => {
        URL.revokeObjectURL(url);
        if (audioCtx) {
          try { audioCtx.close(); } catch (e) {}
        }
        if (chunks.length === 0) {
          console.warn('⚠️ No chunks, returning original');
          return resolve(inputBlob);
        }
        const compressed = new Blob(chunks, { type: mimeType });
        console.log('✅ Compressed:', (compressed.size / 1024 / 1024).toFixed(1), 'MB');
        resolve(compressed);
      };

      recorder.onstop = finish;
      recorder.onerror = (e) => {
        console.error('Recorder error:', e);
        finish();
      };

      let animId;
      const draw = () => {
        if (video.paused || video.ended) return;
        try { ctx.drawImage(video, 0, 0, w, h); } catch (e) {}
        animId = requestAnimationFrame(draw);
      };

      video.onplay = () => draw();
      video.onended = () => {
        cancelAnimationFrame(animId);
        setTimeout(() => {
          if (recorder.state !== 'inactive') recorder.stop();
        }, 300);
      };

      recorder.start(1000);

      try {
        video.currentTime = 0;
        await video.play();
      } catch (playErr) {
        console.error('Play failed:', playErr);
        video.muted = true;
        try { await video.play(); } catch (e) {
          if (recorder.state !== 'inactive') recorder.stop();
        }
      }

      const safetyTime = Math.max(duration * 3000, 60000);
      setTimeout(() => {
        if (recorder.state !== 'inactive') {
          console.warn('⚠️ Compression timeout');
          cancelAnimationFrame(animId);
          recorder.stop();
        }
      }, safetyTime);

    } catch (err) {
      console.error('❌ Compression failed:', err);
      resolve(inputBlob);
    }
  });
}

// ==================== AUTH (RANDOM EMAIL/PASSWORD) ====================
async function checkSession() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && session.user) {
      state.loggedIn = true;
      state.user = session.user;
      state.email = session.user.email;
      await loadUserChannel();
      if (loginGate) loginGate.classList.add('hide');
      updateUI();
      await loadFeedFromSupabase();
      await loadNotifications();
    } else {
      if (loginGate) loginGate.classList.remove('hide');
    }
  } catch (e) {
    console.error('Session check failed:', e);
    if (loginGate) loginGate.classList.remove('hide');
  }
}

async function loadUserChannel() {
  if (!state.user) return;
  try {
    const { data } = await supabaseClient
      .from('channels')
      .select('*')
      .eq('owner_id', state.user.id)
      .maybeSingle();
    state.channel = data || null;
  } catch (e) {
    console.error('Channel load error:', e);
    state.channel = null;
  }
}

// ============================================================
// LOGIN - RANDOM EMAIL/PASSWORD SUPPORT
// ============================================================
if (gateLoginBtn) {
  gateLoginBtn.addEventListener('click', async () => {
    const email = gateEmail.value.trim();
    const pass = gatePassword.value.trim();
    
    if (!email || !email.includes('@')) { 
      showToast('Valid email enter karein'); 
      return; 
    }
    if (!pass || pass.length < 1) { 
      showToast('Password enter karein'); 
      return; 
    }

    gateLoginBtn.disabled = true;
    gateLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';

    try {
      // STEP 1: Try login
      let { data, error } = await supabaseClient.auth.signInWithPassword({ 
        email, 
        password: pass 
      });

      // STEP 2: If login fails, try signup
      if (error) {
        console.log('Login failed, trying signup...');
        const signup = await supabaseClient.auth.signUp({ 
          email, 
          password: pass 
        });
        
        if (signup.error) {
          showToast('❌ ' + signup.error.message);
          gateLoginBtn.disabled = false;
          gateLoginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login / Sign Up';
          return;
        }
        
        data = signup.data;
        
        // STEP 3: If no session (email confirmation needed), try login again
        if (!signup.data.session) {
          console.log('No session from signup, trying login...');
          const retry = await supabaseClient.auth.signInWithPassword({ 
            email, 
            password: pass 
          });
          
          if (retry.error) {
            showToast('📧 Supabase → Auth → Providers → Email → Confirm email OFF karein');
            gateLoginBtn.disabled = false;
            gateLoginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login / Sign Up';
            return;
          }
          data = retry.data;
        }
        
        showToast('✅ Account created!');
      }

      // STEP 4: Logged in successfully
      if (data && data.user) {
        state.loggedIn = true;
        state.user = data.user;
        state.email = data.user.email;
        await loadUserChannel();
        if (loginGate) loginGate.classList.add('hide');
        showToast('✅ Welcome ' + email);
        updateUI();
        await loadFeedFromSupabase();
        await loadNotifications();
      }

    } catch (err) {
      console.error('Login error:', err);
      showToast('❌ ' + err.message);
    }

    gateLoginBtn.disabled = false;
    gateLoginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login / Sign Up';
  });
}

if (gatePassword) {
  gatePassword.addEventListener('keydown', e => { 
    if (e.key === 'Enter') gateLoginBtn.click(); 
  });
}
if (gateEmail) {
  gateEmail.addEventListener('keydown', e => { 
    if (e.key === 'Enter') gatePassword.focus(); 
  });
}

// ==================== LOGOUT ====================
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    state.loggedIn = false;
    state.user = null;
    state.email = '';
    state.channel = null;
    state.allVideos = [];
    state.allChannels = [];
    state.notifications = [];
    state.subscriptions = [];
    if (settingsPage) settingsPage.classList.remove('open');
    if (profilePanel) profilePanel.classList.remove('open');
    if (loginGate) loginGate.classList.remove('hide');
    if (feed) feed.querySelectorAll('.video-card').forEach(c => c.remove());
    if (emptyFeed) emptyFeed.style.display = 'flex';
    showToast('👋 Logged out');
  });
}

// ==================== FEED ====================
async function loadFeedFromSupabase() {
  try {
    const { data: videos, error } = await supabaseClient
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { 
      console.error('Feed error:', error); 
      return; 
    }
    state.allVideos = videos || [];

    const { data: channels } = await supabaseClient.from('channels').select('*');
    state.allChannels = channels || [];

    if (state.user) {
      const { data: subs } = await supabaseClient
        .from('subscriptions')
        .select('channel_id')
        .eq('user_id', state.user.id);
      state.subscriptions = (subs || []).map(s => s.channel_id);
    }

    renderFeed('', currentFilter);
  } catch (e) {
    console.error('Feed load error:', e);
  }
}

let currentFilter = 'home';

function renderFeed(filterText = '', categoryFilter = null) {
  if (!feed) return;
  const cat = categoryFilter || currentFilter;
  feed.querySelectorAll('.video-card').forEach(c => c.remove());

  let sourceVideos = [...state.allVideos];

  if (cat === 'home') {
    sourceVideos = sourceVideos.filter(v => v.type !== 'short' && !v.is_live);
  } else if (cat === 'shorts') {
    sourceVideos = sourceVideos.filter(v => v.type === 'short');
  } else if (cat === 'subs') {
    if (!state.subscriptions.length) {
      sourceVideos = [];
    } else {
      sourceVideos = sourceVideos.filter(v => {
        const ch = state.allChannels.find(c => c.username === v.channel_username);
        return ch && state.subscriptions.includes(ch.id);
      });
    }
  } else if (cat === 'gaming') {
    sourceVideos = sourceVideos.filter(v => v.category === 'Gaming');
  } else if (cat === 'sports') {
    sourceVideos = sourceVideos.filter(v => v.category === 'Sports');
  } else if (cat === 'music') {
    sourceVideos = sourceVideos.filter(v => v.category === 'Music');
  } else if (cat === 'news') {
    sourceVideos = sourceVideos.filter(v => v.category === 'News');
  } else if (cat === 'trending') {
    sourceVideos = sourceVideos.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (cat === 'yourvideos') {
    sourceVideos = sourceVideos.filter(v => v.owner_id === state.user?.id);
  }

  if (filterText.trim()) {
    const q = filterText.toLowerCase();
    sourceVideos = sourceVideos.filter(v =>
      v.title.toLowerCase().includes(q) ||
      (v.description && v.description.toLowerCase().includes(q))
    );
  }

  const titleMap = {
    home: '<i class="fas fa-home"></i> Home',
    shorts: '<i class="fas fa-bolt"></i> Shorts',
    subs: '<i class="fas fa-users"></i> Subscriptions',
    gaming: '<i class="fas fa-gamepad"></i> Gaming',
    sports: '<i class="fas fa-futbol"></i> Sports',
    yourvideos: '<i class="fas fa-video"></i> Your Videos',
    trending: '<i class="fas fa-fire"></i> Trending',
    music: '<i class="fas fa-music"></i> Music',
    news: '<i class="fas fa-newspaper"></i> News'
  };
  if (feedTitle) feedTitle.innerHTML = titleMap[cat] || titleMap.home;

  if (sourceVideos.length === 0) {
    if (emptyFeed) {
      emptyFeed.style.display = 'flex';
      if (cat === 'subs') {
        emptyFeed.innerHTML = `<i class="fas fa-users"></i><h3>No subscriptions</h3><p>Subscribe to channels to see their videos here.</p>`;
      } else if (cat === 'shorts') {
        emptyFeed.innerHTML = `<i class="fas fa-bolt"></i><h3>No shorts yet</h3><p>Upload short videos to see them here!</p>`;
      } else {
        emptyFeed.innerHTML = `<i class="fas fa-video"></i><h3>No videos yet</h3><p>Tap + to upload your first video!</p>`;
      }
    }
    return;
  }
  if (emptyFeed) emptyFeed.style.display = 'none';

  sourceVideos.forEach((vid, idx) => {
    const card = document.createElement('div');
    card.className = 'video-card';
    if (vid.type === 'short') card.classList.add('short-card');
    card.style.animationDelay = (idx * 0.06) + 's';

    const ch = state.allChannels.find(c => c.username === vid.channel_username) || {};
    const isMine = vid.owner_id === state.user?.id;
    const isLive = vid.is_live === true;

    const chAvatarHTML = ch.avatar_url
      ? `<img src="${ch.avatar_url}" style="width:100%;height:100%;object-fit:cover;">`
      : (ch.avatar_emoji || '👤');

    const thumbHTML = vid.thumbnail_url
      ? `<img src="${vid.thumbnail_url}" style="width:100%;height:100%;object-fit:cover;">`
      : `<i class="fas fa-play-circle" style="font-size:3.8rem; color:#ffffffcc;"></i>`;

    const menuBtnHTML = isMine ? `<button class="my-video-menu-btn" data-mymenu="${vid.id}"><i class="fas fa-ellipsis-v"></i></button>` : '';

    card.innerHTML = `
      <div class="thumbnail-box">
        ${thumbHTML}
        <span class="duration-badge">${vid.duration || '0:00'}</span>
        ${isLive ? '<span class="live-badge">🔴 LIVE</span>' : ''}
        ${vid.type === 'short' ? '<span class="short-badge">⚡ SHORT</span>' : ''}
        ${isMine && !isLive ? '<span class="live-badge" style="background:#1e8b4b;">YOURS</span>' : ''}
        ${menuBtnHTML}
      </div>
      <div class="video-details">
        <div class="channel-icon">${chAvatarHTML}</div>
        <div class="video-meta">
          <div class="video-title">${escapeHTML(vid.title)}</div>
          <div class="channel-name"><i class="fas fa-check-circle"></i> ${escapeHTML(ch.name || vid.channel_name || 'Unknown')}</div>
          <div class="video-stats">
            <span><i class="fas fa-eye"></i> ${vid.views || 0} views</span>
            <span><i class="fas fa-thumbs-up"></i> ${vid.likes || 0}</span>
          </div>
        </div>
      </div>
    `;

    // ===== FIXED CLICK HANDLER =====
    card.addEventListener('click', (e) => {
      console.log('🎬 Video card clicked:', vid.title);
      
      if (e.target.closest('.my-video-menu-btn')) {
        e.stopPropagation();
        e.preventDefault();
        openVideoActions(vid);
        return;
      }
      
      openWatchPage(vid);
    });

    feed.appendChild(card);
  });
}

// ============================================================
// WATCH PAGE (FIXED)
// ============================================================
async function openWatchPage(vid) {
  console.log('🎬 Opening watch page for:', vid.title);
  
  if (!vid) {
    showToast('❌ Video data missing');
    return;
  }
  
  if (!watchPage || !watchBody) {
    console.error('❌ watchPage or watchBody element not found!');
    showToast('❌ Watch page missing in HTML');
    return;
  }

  if (watchHeaderTitle) watchHeaderTitle.textContent = vid.title;

  let videoUrl = vid.video_url;
  console.log('📹 Video URL:', videoUrl);

  // Try cache first
  try {
    const cachedBlob = await getVideoFromIDB(vid.id);
    if (cachedBlob) {
      videoUrl = URL.createObjectURL(cachedBlob);
      console.log('✅ Loaded from cache');
    } else if (vid.video_url) {
      try {
        const resp = await fetch(vid.video_url);
        if (resp.ok) {
          const blob = await resp.blob();
          await saveVideoToIDB(vid.id, blob);
          videoUrl = URL.createObjectURL(blob);
          console.log('✅ Fetched and cached');
        }
      } catch (e) { 
        console.warn('Fetch failed, using direct URL');
        videoUrl = vid.video_url; 
      }
    }
  } catch (e) {
    console.error('Cache error:', e);
  }

  const ch = state.allChannels.find(c => c.username === vid.channel_username) || {};
  const isMine = vid.owner_id === state.user?.id;
  const chId = ch.id;

  const chAvatarHTML = ch.avatar_url
    ? `<img src="${ch.avatar_url}" style="width:100%;height:100%;object-fit:cover;">`
    : (ch.avatar_emoji || '👤');

  let isSubscribed = state.subscriptions.includes(chId);

  let videoHTML = '';
  if (videoUrl) {
    videoHTML = `<video src="${videoUrl}" controls autoplay playsinline preload="metadata"></video>`;
    console.log('✅ Video element created');
  } else {
    videoHTML = `<i class="fas fa-play-circle"></i>`;
    console.warn('⚠️ No video URL available');
  }

  watchBody.innerHTML = `
    <div class="watch-video-area">
      ${videoHTML}
    </div>
    <div class="watch-info">
      <div class="watch-title">${escapeHTML(vid.title)}</div>
      <div class="watch-meta">
        <span><i class="fas fa-eye"></i> ${vid.views || 0} views</span>
        <span><i class="fas fa-user"></i> ${escapeHTML(ch.name || 'Unknown')}</span>
      </div>
      <div class="watch-channel-row">
        <div class="watch-channel-icon" id="watchChannelIcon" style="cursor:pointer;">${chAvatarHTML}</div>
        <div class="watch-channel-info" id="watchChannelInfo" style="cursor:pointer;">
          <div class="watch-channel-name"><i class="fas fa-check-circle"></i> ${escapeHTML(ch.name || 'Unknown')}</div>
          <div class="watch-channel-subs" id="watchSubsCount">${ch.subscribers_count || 0} subscribers</div>
        </div>
        ${!isMine && chId ? `
          <button class="subscribe-btn ${isSubscribed ? 'subscribed' : ''}" id="subBtn">
            ${isSubscribed ? '<i class="fas fa-check"></i> Subscribed' : '<i class="fas fa-plus"></i> Subscribe'}
          </button>
        ` : ''}
      </div>
      <div class="watch-actions">
        <button class="action-btn" id="likeBtn"><i class="fas fa-thumbs-up"></i> <span id="likeCount">${vid.likes || 0}</span></button>
        <button class="action-btn" id="shareBtn"><i class="fas fa-share"></i> Share</button>
        <button class="action-btn" id="saveBtn"><i class="fas fa-bookmark"></i> Save</button>
      </div>
      <div class="watch-desc">${escapeHTML(vid.description || 'No description.')}</div>
      <div class="comments-section">
        <div class="comments-title"><i class="fas fa-comments"></i> Comments (<span id="commentCount">0</span>)</div>
        <div class="comment-input-row">
          <input type="text" id="commentInput" placeholder="Add a comment...">
          <button class="comment-send-btn" id="commentSendBtn"><i class="fas fa-paper-plane"></i></button>
        </div>
        <div id="commentsList"><div class="no-comments">Loading comments...</div></div>
      </div>
    </div>
  `;

  // Increment views
  if (vid.owner_id !== state.user?.id) {
    try {
      const newViews = (vid.views || 0) + 1;
      await supabaseClient.from('videos').update({ views: newViews }).eq('id', vid.id);
      vid.views = newViews;
    } catch (e) { console.warn('View increment failed'); }
  }

  await loadComments(vid.id);

  // Channel click
  document.getElementById('watchChannelIcon')?.addEventListener('click', () => {
    watchPage.classList.remove('open');
    openChannelView(vid.channel_username);
  });
  document.getElementById('watchChannelInfo')?.addEventListener('click', () => {
    watchPage.classList.remove('open');
    openChannelView(vid.channel_username);
  });

  // Subscribe
  document.getElementById('subBtn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    if (btn.classList.contains('subscribed')) {
      await supabaseClient.from('subscriptions').delete().eq('user_id', state.user.id).eq('channel_id', chId);
      const newCount = Math.max(0, (ch.subscribers_count || 1) - 1);
      await supabaseClient.from('channels').update({ subscribers_count: newCount }).eq('id', chId);
      btn.classList.remove('subscribed');
      btn.innerHTML = '<i class="fas fa-plus"></i> Subscribe';
      document.getElementById('watchSubsCount').textContent = newCount + ' subscribers';
      state.subscriptions = state.subscriptions.filter(id => id !== chId);
      showToast('Unsubscribed');
    } else {
      await supabaseClient.from('subscriptions').insert({ user_id: state.user.id, channel_id: chId });
      const newCount = (ch.subscribers_count || 0) + 1;
      await supabaseClient.from('channels').update({ subscribers_count: newCount }).eq('id', chId);
      btn.classList.add('subscribed');
      btn.innerHTML = '<i class="fas fa-check"></i> Subscribed';
      document.getElementById('watchSubsCount').textContent = newCount + ' subscribers';
      state.subscriptions.push(chId);
      showToast('✅ Subscribed!');
    }
  });

  // Like
  document.getElementById('likeBtn')?.addEventListener('click', async () => {
    const newLikes = (vid.likes || 0) + 1;
    await supabaseClient.from('videos').update({ likes: newLikes }).eq('id', vid.id);
    document.getElementById('likeCount').textContent = newLikes;
    showToast('👍 Liked');
  });

  // Share
  document.getElementById('shareBtn')?.addEventListener('click', () => {
    navigator.clipboard.writeText(vid.video_url || window.location.href).then(() => showToast('🔗 Link copied'));
  });

  // Save
  document.getElementById('saveBtn')?.addEventListener('click', () => showToast('📌 Saved'));

  // Comment
  document.getElementById('commentSendBtn')?.addEventListener('click', async () => {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if (!text) return;
    if (!state.user) { showToast('Login required'); return; }

    const { error } = await supabaseClient.from('comments').insert({
      video_id: vid.id,
      user_id: state.user.id,
      author_name: state.channel?.name || 'User',
      text: text
    });

    if (error) { showToast('❌ ' + error.message); return; }
    input.value = '';
    showToast('💬 Comment posted');
    await loadComments(vid.id);
  });

  document.getElementById('commentInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('commentSendBtn')?.click();
  });

  // OPEN watch page
  watchPage.classList.add('open');
  console.log('✅ Watch page opened');
}

async function loadComments(videoId) {
  const list = document.getElementById('commentsList');
  const countEl = document.getElementById('commentCount');
  if (!list) return;

  try {
    const { data, error } = await supabaseClient
      .from('comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });

    if (error) { 
      list.innerHTML = '<div class="no-comments">Comments load nahi hui</div>'; 
      return; 
    }
    if (countEl) countEl.textContent = (data || []).length;

    if (!data || data.length === 0) {
      list.innerHTML = '<div class="no-comments">No comments yet. Be the first!</div>';
      return;
    }

    list.innerHTML = data.map(c => `
      <div class="comment-item">
        <div class="comment-avatar">${escapeHTML((c.author_name || 'U').charAt(0))}</div>
        <div class="comment-body">
          <div class="comment-author">${escapeHTML(c.author_name || 'User')}</div>
          <div class="comment-text">${escapeHTML(c.text)}</div>
          <div class="comment-time">${new Date(c.created_at).toLocaleString()}</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = '<div class="no-comments">Error loading comments</div>';
  }
}

if (watchBackBtn) watchBackBtn.addEventListener('click', () => watchPage.classList.remove('open'));

// ============================================================
// VIDEO ACTIONS (3-dot menu)
// ============================================================
function openVideoActions(vid) {
  if (!vid) return;
  currentEditVideoId = vid.id;
  currentEditThumbnailData = null;

  const thumbHTML = vid.thumbnail_url ? `<img src="${vid.thumbnail_url}">` : '';
  if (vaThumb) vaThumb.innerHTML = thumbHTML;
  if (vaTitle) vaTitle.textContent = vid.title;
  if (vaMeta) vaMeta.textContent = `${vid.views || 0} views · ${vid.likes || 0} likes`;

  const visLabels = { public: 'Public', unlisted: 'Unlisted', private: 'Private' };
  if (vaPrivacySub) vaPrivacySub.textContent = visLabels[vid.visibility || 'public'];

  if (videoActionsMenu) videoActionsMenu.classList.add('open');
  if (videoActionsOverlay) videoActionsOverlay.classList.add('open');
}

function closeVideoActions() {
  if (videoActionsMenu) videoActionsMenu.classList.remove('open');
  if (videoActionsOverlay) videoActionsOverlay.classList.remove('open');
}

if (videoActionsOverlay) videoActionsOverlay.addEventListener('click', closeVideoActions);

if (vaEditBtn) {
  vaEditBtn.addEventListener('click', () => {
    const vid = state.allVideos.find(v => v.id === currentEditVideoId);
    if (!vid) return;
    closeVideoActions();
    openEditVideoPage(vid);
  });
}

if (vaPrivacyBtn) {
  vaPrivacyBtn.addEventListener('click', async () => {
    const vid = state.allVideos.find(v => v.id === currentEditVideoId);
    if (!vid) return;

    const current = vid.visibility || 'public';
    const next = current === 'public' ? 'unlisted' : (current === 'unlisted' ? 'private' : 'public');
    const labels = { public: 'Public', unlisted: 'Unlisted', private: 'Private' };

    const { error } = await supabaseClient.from('videos').update({ visibility: next }).eq('id', vid.id);
    if (error) { showToast('❌ ' + error.message); return; }

    vid.visibility = next;
    if (vaPrivacySub) vaPrivacySub.textContent = labels[next];
    showToast(`✅ Changed to ${labels[next]}`);
    await loadFeedFromSupabase();
  });
}

if (vaDeleteBtn) {
  vaDeleteBtn.addEventListener('click', async () => {
    const vid = state.allVideos.find(v => v.id === currentEditVideoId);
    if (!vid) return;

    if (!confirm(`Delete "${vid.title}"?\n\nThis cannot be undone.`)) return;

    vaDeleteBtn.style.pointerEvents = 'none';
    const subEl = vaDeleteBtn.querySelector('.va-sub');
    if (subEl) subEl.textContent = 'Deleting...';

    try {
      try {
        if (vid.video_url) {
          const parts = vid.video_url.split('/videos/');
          if (parts[1]) {
            await supabaseClient.storage.from('videos').remove([decodeURIComponent(parts[1])]);
          }
        }
        if (vid.thumbnail_url) {
          const parts = vid.thumbnail_url.split('/thumbnails/');
          if (parts[1]) {
            await supabaseClient.storage.from('thumbnails').remove([decodeURIComponent(parts[1])]);
          }
        }
      } catch (e) { console.warn('Storage delete failed:', e); }

      const { error } = await supabaseClient.from('videos').delete().eq('id', vid.id);
      if (error) throw error;

      await deleteVideoFromIDB(vid.id);

      showToast('🗑 Video deleted');
      closeVideoActions();
      await loadFeedFromSupabase();
    } catch (err) {
      showToast('❌ ' + err.message);
    }

    vaDeleteBtn.style.pointerEvents = '';
    if (subEl) subEl.textContent = 'Permanently remove';
  });
}

// ============================================================
// EDIT VIDEO PAGE
// ============================================================
function openEditVideoPage(vid) {
  currentEditVideoId = vid.id;
  currentEditThumbnailData = null;

  if (editVideoTitle) editVideoTitle.value = vid.title || '';
  if (editVideoDesc) editVideoDesc.value = vid.description || '';
  if (editVideoCategory) editVideoCategory.value = vid.category || 'Gaming';

  const thumbHTML = vid.thumbnail_url
    ? `<img src="${vid.thumbnail_url}" style="width:100%;height:100%;object-fit:cover;"><div class="thumb-overlay" style="opacity:0.7;"><i class="fas fa-camera-retro"></i><span>Tap to change</span></div>`
    : `<div class="thumb-overlay"><i class="fas fa-camera-retro"></i><span>Tap to add</span></div>`;
  if (editVideoThumb) editVideoThumb.innerHTML = thumbHTML;

  document.querySelectorAll('#editVideoPage .visibility-option').forEach(v => {
    v.classList.toggle('active', v.dataset.vis === (vid.visibility || 'public'));
  });

  if (editVideoPage) editVideoPage.classList.add('open');
}

if (editVideoBackBtn) editVideoBackBtn.addEventListener('click', () => editVideoPage.classList.remove('open'));
if (editVideoCancelBtn) editVideoCancelBtn.addEventListener('click', () => editVideoPage.classList.remove('open'));

if (editVideoThumb) {
  editVideoThumb.addEventListener('click', () => {
    if (editVideoThumbInput) {
      editVideoThumbInput.value = '';
      editVideoThumbInput.click();
    }
  });
}

if (editVideoThumbInput) {
  editVideoThumbInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      currentEditThumbnailData = ev.target.result;
      if (editVideoThumb) {
        editVideoThumb.innerHTML = `<img src="${currentEditThumbnailData}" style="width:100%;height:100%;object-fit:cover;"><div class="thumb-overlay" style="opacity:0.7;"><i class="fas fa-check-circle"></i><span>Tap to change</span></div>`;
      }
      showToast('🖼 New thumbnail ready');
    };
    reader.readAsDataURL(file);
  });
}

document.querySelectorAll('#editVideoPage .visibility-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('#editVideoPage .visibility-option').forEach(v => v.classList.remove('active'));
    opt.classList.add('active');
  });
});

if (editVideoSaveBtn) {
  editVideoSaveBtn.addEventListener('click', async () => {
    if (!currentEditVideoId) return;

    const vid = state.allVideos.find(v => v.id === currentEditVideoId);
    if (!vid) return;

    const newTitle = editVideoTitle.value.trim();
    if (!newTitle) { showToast('Title required'); return; }

    const newDesc = editVideoDesc.value.trim();
    const newCat = editVideoCategory.value;
    const newVis = document.querySelector('#editVideoPage .visibility-option.active')?.dataset.vis || 'public';

    editVideoSaveBtn.disabled = true;
    editVideoSaveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
      let newThumbnailUrl = vid.thumbnail_url;

      if (currentEditThumbnailData) {
        const thumbResp = await fetch(currentEditThumbnailData);
        const thumbBlob = await thumbResp.blob();
        const thumbPath = `${state.user.id}/${currentEditVideoId}_thumb_${Date.now()}.jpg`;
        const { error: thumbErr } = await supabaseClient.storage
          .from('thumbnails')
          .upload(thumbPath, thumbBlob, { contentType: 'image/jpeg', upsert: false });

        if (!thumbErr) {
          newThumbnailUrl = supabaseClient.storage.from('thumbnails').getPublicUrl(thumbPath).data.publicUrl;
        }
      }

      const { error } = await supabaseClient.from('videos').update({
        title: newTitle,
        description: newDesc,
        category: newCat,
        visibility: newVis,
        thumbnail_url: newThumbnailUrl
      }).eq('id', currentEditVideoId);

      if (error) throw error;

      showToast('✅ Video updated!');
      editVideoPage.classList.remove('open');
      await loadFeedFromSupabase();
    } catch (err) {
      showToast('❌ ' + err.message);
    }

    editVideoSaveBtn.disabled = false;
    editVideoSaveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
  });
}

// ============================================================
// TERMS PAGE
// ============================================================
if (termsBtn) {
  termsBtn.addEventListener('click', () => {
    if (termsPage) termsPage.classList.add('open');
  });
}
if (termsBackBtn) {
  termsBackBtn.addEventListener('click', () => {
    if (termsPage) termsPage.classList.remove('open');
  });
}

// ============================================================
// SUPPORT CHAT
// ============================================================
if (contactBtn) {
  contactBtn.addEventListener('click', () => {
    if (supportPage) {
      supportPage.classList.add('open');
      if (supportInput) supportInput.focus();
    }
  });
}
if (supportBackBtn) {
  supportBackBtn.addEventListener('click', () => {
    if (supportPage) supportPage.classList.remove('open');
  });
}

const BOT_RESPONSES = {
  'upload': '📹 To upload a video:\n1. Tap the + button\n2. Choose "Upload Video" or "Upload Short"\n3. Record or pick from gallery\n4. Fill in title, description, thumbnail\n5. Tap Publish',
  'monetization': '💰 Monetization requires:\n• 1,000 views\n• 4,000 watch hours\n• 1,000 subscribers\n\nOnce eligible, apply via Profile → Monetization.',
  'video not playing': '🎬 If video is not playing:\n1. Check internet connection\n2. Refresh the page\n3. Try clearing cache in Settings\n4. Make sure the video format is supported (MP4, WebM)',
  'account': '👤 For account issues:\n1. Try logging out and logging back in\n2. Reset your password if needed\n3. Contact support at syedtechnical63@gmail.com for help',
  'delete': '🗑 To delete your video:\n1. Find your video (with YOURS badge)\n2. Tap the 3-dot menu\n3. Choose "Delete Video"\n4. Confirm deletion',
  'edit': '✏️ To edit your video:\n1. Tap 3-dot menu on your video\n2. Choose "Edit Video"\n3. Change title, description, or category\n4. Save changes',
  'privacy': '🔒 To change privacy:\n1. Tap 3-dot menu\n2. Choose "Change Privacy"\n3. Toggle: Public → Unlisted → Private',
  'hello': 'Hi there! 👋 How can I help you today?',
  'hi': 'Hello! 👋 How can I help you today?',
  'thanks': 'You\'re welcome! 😊 Anything else I can help with?',
  'help': 'I can help with:\n• Uploading videos\n• Monetization\n• Editing videos\n• Privacy settings\n• Account issues\n\nJust ask!',
  'email': '📧 For direct support, email us at:\n**syedtechnical63@gmail.com**',
  'contact': '📧 Contact us at:\n**syedtechnical63@gmail.com**\n\nWe usually reply within 24 hours.'
};

function getBotResponse(userMsg) {
  const msg = userMsg.toLowerCase();
  for (const key of Object.keys(BOT_RESPONSES)) {
    if (msg.includes(key)) return BOT_RESPONSES[key];
  }
  return `Thanks for your message! 📩\n\nOur support team has been notified at **syedtechnical63@gmail.com**. We'll reply as soon as possible.`;
}

function addSupportMessage(text, isUser = false) {
  if (!supportBody) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = 'support-message ' + (isUser ? 'user' : 'bot');
  
  const now = new Date();
  const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  
  const avatarHTML = isUser
    ? `<div class="support-avatar"><i class="fas fa-user"></i></div>`
    : `<div class="support-avatar"><i class="fas fa-robot"></i></div>`;
  
  const formattedText = escapeHTML(text).replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  msgDiv.innerHTML = `
    ${avatarHTML}
    <div class="support-bubble">
      <div class="support-text">${formattedText}</div>
      <div class="support-time">${timeStr}</div>
    </div>
  `;
  
  supportBody.appendChild(msgDiv);
  supportBody.scrollTop = supportBody.scrollHeight;
}

async function sendSupportMessage() {
  if (!supportInput) return;
  const text = supportInput.value.trim();
  if (!text) return;

  supportInput.value = '';
  addSupportMessage(text, true);

  try {
    const messages = JSON.parse(localStorage.getItem('fortube_support_messages') || '[]');
    messages.push({
      from: state.email || 'Anonymous',
      message: text,
      time: new Date().toISOString()
    });
    localStorage.setItem('fortube_support_messages', JSON.stringify(messages.slice(-50)));
  } catch (e) {}

  const typingDiv = document.createElement('div');
  typingDiv.className = 'support-message bot';
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `
    <div class="support-avatar"><i class="fas fa-robot"></i></div>
    <div class="support-bubble">
      <div class="support-text">Typing...</div>
    </div>
  `;
  supportBody.appendChild(typingDiv);
  supportBody.scrollTop = supportBody.scrollHeight;

  setTimeout(() => {
    typingDiv.remove();
    const response = getBotResponse(text);
    addSupportMessage(response, false);
  }, 800);
}

if (supportSendBtn) supportSendBtn.addEventListener('click', sendSupportMessage);
if (supportInput) supportInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendSupportMessage();
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.quick-btn');
  if (btn && btn.dataset.msg) {
    if (supportInput) supportInput.value = btn.dataset.msg;
    sendSupportMessage();
  }
});

// ==================== SUBSCRIPTIONS ====================
async function openSubscriptions() {
  if (!state.user) { showToast('Login first'); return; }
  if (subscriptionsPage) subscriptionsPage.classList.add('open');
  await renderSubscriptions();
}

async function renderSubscriptions() {
  if (!subscriptionsBody) return;
  if (!state.subscriptions.length) {
    subscriptionsBody.innerHTML = '<div class="no-subs">You haven\'t subscribed to any channel yet.</div>';
    return;
  }

  subscriptionsBody.innerHTML = '<div style="text-align:center;padding:20px;color:#8aa9b8;">Loading...</div>';

  const subsChannels = state.allChannels.filter(c => state.subscriptions.includes(c.id));
  const subsVideos = state.allVideos.filter(v => {
    const ch = state.allChannels.find(c => c.username === v.channel_username);
    return ch && state.subscriptions.includes(ch.id);
  });

  let html = '<div class="subs-channels-row">';
  subsChannels.forEach(ch => {
    const avatarHTML = ch.avatar_url
      ? `<img src="${ch.avatar_url}" style="width:100%;height:100%;object-fit:cover;">`
      : (ch.avatar_emoji || '🎬');
    html += `
      <div class="subs-channel-chip" data-username="${escapeHTML(ch.username)}">
        <div class="subs-channel-avatar">${avatarHTML}</div>
        <div class="subs-channel-name">${escapeHTML(ch.name)}</div>
      </div>
    `;
  });
  html += '</div>';

  html += '<div class="profile-section-title" style="margin:20px 4px 10px;"><i class="fas fa-video"></i> Latest videos</div>';

  if (subsVideos.length === 0) {
    html += '<div class="no-subs">No videos from subscribed channels yet.</div>';
  } else {
    subsVideos.forEach(vid => {
      const ch = state.allChannels.find(c => c.username === vid.channel_username) || {};
      const thumbHTML = vid.thumbnail_url
        ? `<img src="${vid.thumbnail_url}" style="width:100%;height:100%;object-fit:cover;">`
        : `<i class="fas fa-play-circle" style="font-size:3.8rem;color:#ffffffcc;"></i>`;
      const chAvatarHTML = ch.avatar_url
        ? `<img src="${ch.avatar_url}" style="width:100%;height:100%;object-fit:cover;">`
        : (ch.avatar_emoji || '👤');
      html += `
        <div class="video-card" data-vid="${vid.id}" style="margin:0 0 14px;">
          <div class="thumbnail-box">
            ${thumbHTML}
            <span class="duration-badge">${vid.duration || '0:00'}</span>
          </div>
          <div class="video-details">
            <div class="channel-icon">${chAvatarHTML}</div>
            <div class="video-meta">
              <div class="video-title">${escapeHTML(vid.title)}</div>
              <div class="channel-name">${escapeHTML(ch.name || '')}</div>
              <div class="video-stats">
                <span><i class="fas fa-eye"></i> ${vid.views || 0}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }

  subscriptionsBody.innerHTML = html;

  subscriptionsBody.querySelectorAll('.subs-channel-chip').forEach(el => {
    el.addEventListener('click', () => {
      subscriptionsPage.classList.remove('open');
      openChannelView(el.dataset.username);
    });
  });

  subscriptionsBody.querySelectorAll('[data-vid]').forEach(el => {
    el.addEventListener('click', () => {
      const vid = state.allVideos.find(v => v.id === el.dataset.vid);
      if (vid) {
        subscriptionsPage.classList.remove('open');
        openWatchPage(vid);
      }
    });
  });
}

if (subsBackBtn) subsBackBtn.addEventListener('click', () => subscriptionsPage.classList.remove('open'));

// ==================== PLUS MENU ====================
function openPlusMenu() {
  if (!state.loggedIn) { showToast('Please login first'); return; }
  if (plusMenu) plusMenu.classList.add('open');
  if (plusMenuOverlay) plusMenuOverlay.classList.add('open');
}

function closePlusMenu() {
  if (plusMenu) plusMenu.classList.remove('open');
  if (plusMenuOverlay) plusMenuOverlay.classList.remove('open');
}

if (navPlus) navPlus.addEventListener('click', openPlusMenu);
if (plusMenuOverlay) plusMenuOverlay.addEventListener('click', closePlusMenu);

if (plusUploadBtn) {
  plusUploadBtn.addEventListener('click', () => {
    closePlusMenu();
    if (!state.channel) { showToast('Create channel first'); openChannelSetup(); return; }
    currentUploadType = 'long';
    setTimeout(() => openCameraPanel(), 300);
  });
}

if (plusShortBtn) {
  plusShortBtn.addEventListener('click', () => {
    closePlusMenu();
    if (!state.channel) { showToast('Create channel first'); openChannelSetup(); return; }
    currentUploadType = 'short';
    setTimeout(() => openCameraPanel(), 300);
  });
}

if (plusLiveBtn) {
  plusLiveBtn.addEventListener('click', () => {
    closePlusMenu();
    handleGoLive();
  });
}

async function handleGoLive() {
  if (!state.channel) { showToast('Create channel first'); openChannelSetup(); return; }
  const subs = state.channel.subscribers_count || 0;
  if (subs < 50) {
    showAlert(
      'Live Streaming Locked',
      `You need at least <strong>50 subscribers</strong> to start live streaming.<br><br>You currently have <strong>${subs}</strong> subscriber(s).`,
      'fa-broadcast-tower'
    );
    return;
  }
  showToast('🔴 Starting live stream...');
  const videoId = 'live_' + Date.now();
  const { error } = await supabaseClient.from('videos').insert({
    id: videoId,
    owner_id: state.user.id,
    channel_id: state.channel.id,
    channel_username: state.channel.username,
    channel_name: state.channel.name,
    title: state.channel.name + ' is LIVE',
    description: 'Live stream',
    duration: 'LIVE',
    category: 'Entertainment',
    type: 'live',
    is_live: true,
    visibility: 'public',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    views: 0,
    likes: 0
  });
  if (error) { showToast('❌ ' + error.message); return; }
  showToast('🔴 You are LIVE!');
  await loadFeedFromSupabase();
}

// ==================== CAMERA ====================
let cameraStream = null;
let facingMode = 'user';
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let recordTimerInterval = null;
let recordSeconds = 0;
let currentUploadType = 'short';
let pendingUpload = null;
let metaTags = [];
let metaVisibility = 'public';
let selectedThumbnailData = null;
let currentVideoBlobUrl = null;

async function openCameraPanel() {
  if (!state.loggedIn) { showToast('Please login first'); return; }
  if (!state.channel) { showToast('Create channel first'); openChannelSetup(); return; }

  if (currentUploadType === 'short') {
    shortVideoBtn.classList.add('active');
    longVideoBtn.classList.remove('active');
  } else {
    longVideoBtn.classList.add('active');
    shortVideoBtn.classList.remove('active');
  }

  cameraPanel.classList.add('open');
  cameraPlaceholder.style.display = 'flex';

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: true
    });
    cameraVideo.srcObject = cameraStream;
    cameraVideo.classList.toggle('no-mirror', facingMode === 'environment');
    cameraPlaceholder.style.display = 'none';
    showToast('📷 Camera ready');
  } catch (err) {
    cameraPlaceholder.innerHTML = `<i class="fas fa-exclamation-triangle"></i><div>Camera unavailable. Use gallery.</div>`;
    showToast('📷 Use gallery instead');
  }
}

function closeCameraPanel() {
  stopRecording();
  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
  cameraVideo.srcObject = null;
  cameraPanel.classList.remove('open');
}

if (camClose) camClose.addEventListener('click', closeCameraPanel);

if (camFlip) {
  camFlip.addEventListener('click', async () => {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true
      });
      cameraVideo.srcObject = cameraStream;
      cameraVideo.classList.toggle('no-mirror', facingMode === 'environment');
    } catch (e) { showToast('Flip failed'); }
  });
}

if (longVideoBtn) {
  longVideoBtn.addEventListener('click', () => {
    currentUploadType = 'long';
    longVideoBtn.classList.add('active');
    shortVideoBtn.classList.remove('active');
  });
}

if (shortVideoBtn) {
  shortVideoBtn.addEventListener('click', () => {
    currentUploadType = 'short';
    shortVideoBtn.classList.add('active');
    longVideoBtn.classList.remove('active');
  });
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  isRecording = false;
  if (recordBtn) recordBtn.classList.remove('recording');
  if (recordTimer) recordTimer.classList.remove('show');
  if (recordTimerInterval) { clearInterval(recordTimerInterval); recordTimerInterval = null; }
}

if (recordBtn) {
  recordBtn.addEventListener('click', () => {
    if (!cameraStream) { showToast('Camera unavailable'); return; }
    if (isRecording) { stopRecording(); showToast('⏹ Stopped'); return; }

    recordedChunks = [];
    try { mediaRecorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm;codecs=vp8,opus' }); }
    catch (e) { try { mediaRecorder = new MediaRecorder(cameraStream); } catch (e2) { showToast('Not supported'); return; } }

    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      openUploadDetails('Recorded video', recordSeconds > 0 ? formatTime(recordSeconds) : '0:15', url);
    };

    mediaRecorder.start();
    isRecording = true;
    recordBtn.classList.add('recording');
    recordTimer.classList.add('show');
    recordSeconds = 0;
    recordTimer.textContent = '00:00';

    recordTimerInterval = setInterval(() => {
      recordSeconds++;
      recordTimer.textContent = formatTime(recordSeconds);
      if (currentUploadType === 'short' && recordSeconds >= 60) { stopRecording(); showToast('Max 60s for short'); }
      if (currentUploadType === 'long' && recordSeconds >= 600) { stopRecording(); showToast('Max 10min'); }
    }, 1000);
  });
}

function openNativeGallery() { nativeGalleryInput.value = ''; nativeGalleryInput.click(); }
if (galleryBtn) galleryBtn.addEventListener('click', openNativeGallery);
if (galleryBtn2) galleryBtn2.addEventListener('click', openNativeGallery);

if (nativeGalleryInput) {
  nativeGalleryInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { showToast('Video file select karein'); return; }
    const url = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      const dur = tempVideo.duration;
      let durationStr = '0:00';
      if (isFinite(dur) && dur > 0) {
        durationStr = Math.floor(dur / 60) + ':' + String(Math.floor(dur % 60)).padStart(2, '0');
      }
      if (isFinite(dur) && dur <= 60 && currentUploadType !== 'long') {
        currentUploadType = 'short';
      }
      openUploadDetails(file.name.replace(/\.[^/.]+$/, ''), durationStr, url);
    };
    tempVideo.onerror = () => openUploadDetails(file.name, '0:00', url);
  });
}

function openUploadDetails(title, duration, url) {
  pendingUpload = { title, duration, url };
  currentVideoBlobUrl = url;
  uploadTitle.value = title.startsWith('Recorded') ? '' : title;
  uploadPreviewDur.textContent = duration;
  uploadPreviewBox.innerHTML = url
    ? `<video src="${url}" muted autoplay loop playsinline></video><span class="preview-dur">${duration}</span>`
    : `<i class="fas fa-play-circle"></i><span class="preview-dur">${duration}</span>`;
  uploadDetailsModal.classList.add('active');
}

if (uploadCancel) {
  uploadCancel.addEventListener('click', () => {
    uploadDetailsModal.classList.remove('active');
    pendingUpload = null;
    currentVideoBlobUrl = null;
  });
}

if (uploadNextBtn) {
  uploadNextBtn.addEventListener('click', () => {
    const title = uploadTitle.value.trim();
    if (!title) { showToast('Title enter karein'); return; }
    pendingUpload.title = title;
    uploadDetailsModal.classList.remove('active');
    openMetadataPage();
  });
}

// ============================================================
// METADATA PAGE (WITH AUTO THUMBNAIL)
// ============================================================
async function openMetadataPage() {
  metaTags = [];
  metaVisibility = 'public';
  selectedThumbnailData = null;
  metaTitle.value = pendingUpload ? pendingUpload.title : '';
  metaDescription.value = '';
  metaCategory.value = 'Gaming';
  document.querySelectorAll('.visibility-option').forEach(v => v.classList.remove('active'));
  document.querySelector('.visibility-option[data-vis="public"]').classList.add('active');
  renderTags();
  uploadProgressWrap.style.display = 'none';

  thumbnailPicker.innerHTML = `
    <video id="thumbPreviewVideo" muted playsinline></video>
    <div class="thumb-overlay" id="thumbOverlay">
      <i class="fas fa-camera-retro"></i><span>Loading thumbnail...</span>
    </div>
  `;
  const newThumbVideo = document.getElementById('thumbPreviewVideo');
  if (currentVideoBlobUrl) { newThumbVideo.src = currentVideoBlobUrl; newThumbVideo.style.display = 'block'; }

  metadataPage.classList.add('open');

  if (currentVideoBlobUrl) {
    try {
      showToast('🎨 Auto-generating thumbnail...');
      const resp = await fetch(currentVideoBlobUrl);
      const blob = await resp.blob();
      const autoThumb = await generateThumbnailFromVideo(blob, 1);

      selectedThumbnailData = autoThumb;

      thumbnailPicker.innerHTML = `
        <img src="${autoThumb}" style="width:100%;height:100%;object-fit:cover;">
        <div class="thumb-status" style="display:flex;">
          <i class="fas fa-check-circle"></i> <span>Auto-generated</span>
        </div>
      `;
      showToast('✅ Auto thumbnail ready!');
    } catch (err) {
      console.warn('Auto thumbnail failed:', err);
      thumbnailPicker.innerHTML = `
        <video id="thumbPreviewVideo" muted playsinline src="${currentVideoBlobUrl}"></video>
        <div class="thumb-overlay">
          <i class="fas fa-camera-retro"></i><span>Tap to set thumbnail</span>
        </div>
      `;
    }
  }
}

if (metadataBackBtn) {
  metadataBackBtn.addEventListener('click', () => {
    metadataPage.classList.remove('open');
    if (pendingUpload) uploadDetailsModal.classList.add('active');
  });
}

if (metadataCancelBtn) {
  metadataCancelBtn.addEventListener('click', () => {
    metadataPage.classList.remove('open');
    pendingUpload = null;
    currentVideoBlobUrl = null;
  });
}

// ============================================================
// THUMBNAIL ACTIONS
// ============================================================
if (thumbnailPicker) {
  thumbnailPicker.addEventListener('click', (e) => {
    if (e.target.closest('.thumb-action-btn')) return;
    if (e.target.closest('.thumb-status')) return;
    thumbnailInput.value = '';
    thumbnailInput.click();
  });
}

document.getElementById('autoThumbBtn')?.addEventListener('click', async (e) => {
  e.stopPropagation();
  if (!currentVideoBlobUrl) { showToast('No video'); return; }
  showToast('🎨 Generating...');
  try {
    const resp = await fetch(currentVideoBlobUrl);
    const blob = await resp.blob();
    const thumb = await generateThumbnailFromVideo(blob, 1);
    selectedThumbnailData = thumb;
    thumbnailPicker.innerHTML = `
      <img src="${thumb}" style="width:100%;height:100%;object-fit:cover;">
      <div class="thumb-status" style="display:flex;">
        <i class="fas fa-check-circle"></i> <span>Auto-generated</span>
      </div>
    `;
    showToast('✅ Auto thumbnail ready!');
  } catch (err) {
    showToast('❌ ' + err.message);
  }
});

document.getElementById('customThumbBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  thumbnailInput.value = '';
  thumbnailInput.click();
});

if (thumbnailInput) {
  thumbnailInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Image file select karein'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      selectedThumbnailData = ev.target.result;
      thumbnailPicker.innerHTML = `
        <img src="${selectedThumbnailData}" style="width:100%;height:100%;object-fit:cover;">
        <div class="thumb-status" style="display:flex;">
          <i class="fas fa-check-circle"></i> <span>Custom thumbnail</span>
        </div>
      `;
      showToast('🖼 Custom thumbnail set');
    };
    reader.readAsDataURL(file);
  });
}

function renderTags() {
  tagsContainer.innerHTML = metaTags.map((t, i) => `<span class="tag-chip">#${escapeHTML(t)}<i class="fas fa-times" data-idx="${i}"></i></span>`).join('');
  tagsContainer.querySelectorAll('.tag-chip i').forEach(el => {
    el.addEventListener('click', () => { metaTags.splice(parseInt(el.dataset.idx), 1); renderTags(); });
  });
}

if (addTagBtn) {
  addTagBtn.addEventListener('click', () => {
    const val = metaTagInput.value.trim().replace(/^#/, '').replace(/,/g, '');
    if (!val || metaTags.includes(val) || metaTags.length >= 10) return;
    metaTags.push(val);
    metaTagInput.value = '';
    renderTags();
  });
}

if (metaTagInput) {
  metaTagInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTagBtn.click(); }
  });
}

document.querySelectorAll('#metadataPage .visibility-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('#metadataPage .visibility-option').forEach(v => v.classList.remove('active'));
    opt.classList.add('active');
    metaVisibility = opt.dataset.vis;
  });
});

// ============================================================
// PUBLISH
// ============================================================
if (metadataPublishBtn) {
  metadataPublishBtn.addEventListener('click', async () => {
    const title = metaTitle.value.trim();
    if (!title) { showToast('Title enter karein'); return; }
    if (!pendingUpload || !currentVideoBlobUrl) { showToast('Video missing'); return; }

    metadataPublishBtn.disabled = true;
    metadataPublishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
    uploadProgressWrap.style.display = 'block';
    uploadProgressFill.style.width = '2%';
    uploadProgressText.textContent = 'Preparing video... 2%';

    try {
      const videoId = 'vid_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      const user = state.user;
      const ch = state.channel;

      const resp = await fetch(currentVideoBlobUrl);
      let videoBlob = await resp.blob();
      if (videoBlob.size === 0) throw new Error('Video file empty');

      const originalSizeMB = videoBlob.size / (1024 * 1024);

      const MAX_SIZE_MB = 40;
      if (originalSizeMB > MAX_SIZE_MB) {
        uploadProgressText.textContent = `Compressing ${originalSizeMB.toFixed(1)} MB...`;
        uploadProgressFill.style.width = '10%';
        videoBlob = await compressVideo(videoBlob, MAX_SIZE_MB);
        const newSizeMB = videoBlob.size / (1024 * 1024);
        uploadProgressText.textContent = `Compressed: ${originalSizeMB.toFixed(1)} → ${newSizeMB.toFixed(1)} MB`;
        uploadProgressFill.style.width = '30%';
        await new Promise(r => setTimeout(r, 500));
        if (newSizeMB > 45) throw new Error(`Too large: ${newSizeMB.toFixed(1)} MB`);
      } else {
        uploadProgressFill.style.width = '30%';
        uploadProgressText.textContent = `Video: ${originalSizeMB.toFixed(1)} MB`;
      }

      await saveVideoToIDB(videoId, videoBlob);
      uploadProgressFill.style.width = '35%';
      uploadProgressText.textContent = 'Caching... 35%';

      const videoPath = `${user.id}/${videoId}.webm`;
      const { data: { session } } = await supabaseClient.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) throw new Error('Not authenticated');

      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/videos/${videoPath}`;

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl, true);
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        xhr.setRequestHeader('x-upsert', 'false');
        xhr.setRequestHeader('Content-Type', 'video/webm');

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = 35 + Math.round((e.loaded / e.total) * 50);
            uploadProgressFill.style.width = percent + '%';
            uploadProgressText.textContent = `Uploading... ${percent}%`;
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else {
            let msg = `Upload failed (${xhr.status})`;
            try { const e = JSON.parse(xhr.responseText); if (e.message) msg = e.message; } catch (er) {}
            reject(new Error(msg));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.ontimeout = () => reject(new Error('Timeout'));
        xhr.timeout = 300000;
        xhr.send(videoBlob);
      });

      uploadProgressFill.style.width = '85%';
      uploadProgressText.textContent = 'Uploaded! 85%';

      const { data: { publicUrl: videoPublicUrl } } = supabaseClient.storage.from('videos').getPublicUrl(videoPath);

      let thumbnailUrl = null;
      if (selectedThumbnailData) {
        uploadProgressText.textContent = 'Uploading thumbnail... 90%';
        const thumbResp = await fetch(selectedThumbnailData);
        const thumbBlob = await thumbResp.blob();
        const thumbPath = `${user.id}/${videoId}_thumb.jpg`;
        const { error: thumbErr } = await supabaseClient.storage
          .from('thumbnails')
          .upload(thumbPath, thumbBlob, { contentType: 'image/jpeg', upsert: false });
        if (!thumbErr) {
          thumbnailUrl = supabaseClient.storage.from('thumbnails').getPublicUrl(thumbPath).data.publicUrl;
        }
        uploadProgressFill.style.width = '95%';
      }

      uploadProgressText.textContent = 'Saving... 95%';
      const { error: insertErr } = await supabaseClient.from('videos').insert({
        id: videoId,
        owner_id: user.id,
        channel_id: ch.id,
        channel_username: ch.username,
        channel_name: ch.name,
        title: title,
        description: metaDescription.value.trim(),
        duration: pendingUpload.duration,
        category: metaCategory.value,
        tags: metaTags,
        visibility: metaVisibility,
        video_url: videoPublicUrl,
        thumbnail_url: thumbnailUrl,
        views: 0,
        likes: 0,
        type: currentUploadType
      });

      if (insertErr) throw insertErr;

      uploadProgressFill.style.width = '100%';
      uploadProgressText.textContent = '✅ Published!';
      showToast('✅ Video published!');
      metadataPage.classList.remove('open');
      closeCameraPanel();

      pendingUpload = null;
      currentVideoBlobUrl = null;
      selectedThumbnailData = null;
      metaTags = [];
      setTimeout(() => { uploadProgressWrap.style.display = 'none'; }, 1500);

      await loadFeedFromSupabase();

    } catch (err) {
      console.error('Publish error:', err);
      uploadProgressText.textContent = '❌ ' + (err.message || 'Upload failed');
      showToast('❌ ' + (err.message || 'Upload failed'));
    }

    metadataPublishBtn.disabled = false;
    metadataPublishBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Publish';
  });
}

// ==================== CHANNEL SETUP ====================
let setupBannerData = null;
let setupAvatarData = null;

function openChannelSetup() {
  setupChannelName.value = '';
  setupUsername.value = '';
  setupDesc.value = '';
  setupAvatarEmoji.textContent = '👤';
  setupBannerData = null;
  setupAvatarData = null;
  const existingBannerImg = setupBanner.querySelector('img');
  if (existingBannerImg) existingBannerImg.remove();
  setupBanner.dataset.bannerData = '';
  bannerOverlay.innerHTML = '<i class="fas fa-image"></i><span>Tap to add banner</span>';
  channelSetupPage.classList.add('open');
}

document.addEventListener('click', e => {
  if (e.target.closest('#noChannelBtn')) openChannelSetup();
});

if (channelSetupBackBtn) channelSetupBackBtn.addEventListener('click', () => channelSetupPage.classList.remove('open'));
if (channelSetupCancelBtn) channelSetupCancelBtn.addEventListener('click', () => channelSetupPage.classList.remove('open'));

if (setupBanner) {
  setupBanner.addEventListener('click', () => {
    bannerInput.value = '';
    bannerInput.dataset.target = 'setup';
    bannerInput.click();
  });
}

if (setupAvatar) {
  setupAvatar.addEventListener('click', () => {
    profilePicInput.value = '';
    profilePicInput.dataset.target = 'setup';
    profilePicInput.click();
  });
}

if (bannerInput) {
  bannerInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const target = bannerInput.dataset.target;
    const reader = new FileReader();
    reader.onload = ev => {
      const data = ev.target.result;
      if (target === 'edit') {
        editBannerData = data;
        const existingImg = editBanner.querySelector('img');
        if (existingImg) existingImg.remove();
        const img = document.createElement('img');
        img.src = data;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        editBanner.insertBefore(img, editBanner.firstChild);
        showToast('🖼 Banner ready');
      } else {
        setupBannerData = data;
        const existingImg = setupBanner.querySelector('img');
        if (existingImg) existingImg.remove();
        const img = document.createElement('img');
        img.src = data;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        setupBanner.insertBefore(img, setupBanner.firstChild);
        bannerOverlay.style.opacity = '0.5';
        showToast('🖼 Banner set');
      }
    };
    reader.readAsDataURL(file);
  });
}

if (profilePicInput) {
  profilePicInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const target = profilePicInput.dataset.target;
    const reader = new FileReader();
    reader.onload = ev => {
      const data = ev.target.result;
      if (target === 'edit') {
        editAvatarData = data;
        editAvatarEmoji.innerHTML = `<img src="${data}" style="width:100%;height:100%;object-fit:cover;">`;
        showToast('🖼 Avatar ready');
      } else {
        setupAvatarData = data;
        setupAvatarEmoji.innerHTML = `<img src="${data}" style="width:100%;height:100%;object-fit:cover;">`;
        showToast('🖼 Avatar set');
      }
    };
    reader.readAsDataURL(file);
  });
}

if (channelSetupCreateBtn) {
  channelSetupCreateBtn.addEventListener('click', async () => {
    const name = setupChannelName.value.trim();
    const username = setupUsername.value.trim();
    if (!name || !username) { showToast('Name & username required'); return; }

    const finalUsername = username.startsWith('@') ? username : '@' + username;

    channelSetupCreateBtn.disabled = true;
    channelSetupCreateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

    try {
      let bannerUrl = null;
      if (setupBannerData) {
        const bannerResp = await fetch(setupBannerData);
        const bannerBlob = await bannerResp.blob();
        const bannerPath = `${state.user.id}/banner_${Date.now()}.jpg`;
        const { error: bErr } = await supabaseClient.storage.from('thumbnails').upload(bannerPath, bannerBlob, { contentType: 'image/jpeg', upsert: true });
        if (!bErr) bannerUrl = supabaseClient.storage.from('thumbnails').getPublicUrl(bannerPath).data.publicUrl;
      }

      let avatarUrl = null;
      if (setupAvatarData) {
        const avatarResp = await fetch(setupAvatarData);
        const avatarBlob = await avatarResp.blob();
        const avatarPath = `${state.user.id}/avatar_${Date.now()}.jpg`;
        const { error: aErr } = await supabaseClient.storage.from('thumbnails').upload(avatarPath, avatarBlob, { contentType: 'image/jpeg', upsert: true });
        if (!aErr) avatarUrl = supabaseClient.storage.from('thumbnails').getPublicUrl(avatarPath).data.publicUrl;
      }

      const { data, error } = await supabaseClient.from('channels').insert({
        owner_id: state.user.id,
        name,
        username: finalUsername,
        category: setupCategory.value,
        description: setupDesc.value.trim(),
        avatar_emoji: '🎬',
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
        language: setupLanguage.value,
        currency: setupCurrency.value,
        region: setupRegion.value,
        subscribers_count: 0
      }).select().single();

      if (error) throw error;

      state.channel = data;
      channelSetupPage.classList.remove('open');
      showToast('🎉 Channel created!');
      updateUI();
    } catch (err) {
      showToast('❌ ' + err.message);
    }

    channelSetupCreateBtn.disabled = false;
    channelSetupCreateBtn.innerHTML = '<i class="fas fa-check-circle"></i> Create Channel';
  });
}

// ==================== EDIT CHANNEL ====================
let editBannerData = null;
let editAvatarData = null;

document.addEventListener('click', e => {
  if (e.target.closest('#openEditChannelBtn')) {
    if (!state.channel) return;
    editChannelName.value = state.channel.name || '';
    editUsername.value = state.channel.username || '';
    editCategory.value = state.channel.category || 'Gaming';
    editLanguage.value = state.channel.language || 'English';
    editCurrency.value = state.channel.currency || 'USD';
    editRegion.value = state.channel.region || 'Global';
    editDesc.value = state.channel.description || '';
    editBannerData = null;
    editAvatarData = null;

    const existingBannerImg = editBanner.querySelector('img');
    if (existingBannerImg) existingBannerImg.remove();
    if (state.channel.banner_url) {
      const img = document.createElement('img');
      img.src = state.channel.banner_url;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      editBanner.insertBefore(img, editBanner.firstChild);
    }

    if (state.channel.avatar_url) {
      editAvatarEmoji.innerHTML = `<img src="${state.channel.avatar_url}" style="width:100%;height:100%;object-fit:cover;">`;
    } else {
      editAvatarEmoji.textContent = state.channel.avatar_emoji || '🎬';
    }

    editChannelPage.classList.add('open');
  }
});

if (editChannelBackBtn) editChannelBackBtn.addEventListener('click', () => editChannelPage.classList.remove('open'));
if (editChannelCancelBtn) editChannelCancelBtn.addEventListener('click', () => editChannelPage.classList.remove('open'));

if (editBanner) {
  editBanner.addEventListener('click', () => {
    bannerInput.value = '';
    bannerInput.dataset.target = 'edit';
    bannerInput.click();
  });
}

if (editAvatar) {
  editAvatar.addEventListener('click', () => {
    profilePicInput.value = '';
    profilePicInput.dataset.target = 'edit';
    profilePicInput.click();
  });
}

if (editChannelSaveBtn) {
  editChannelSaveBtn.addEventListener('click', async () => {
    const name = editChannelName.value.trim();
    const username = editUsername.value.trim();
    if (!name || !username) { showToast('Name & username required'); return; }

    const finalUsername = username.startsWith('@') ? username : '@' + username;

    editChannelSaveBtn.disabled = true;
    editChannelSaveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
      let bannerUrl = state.channel.banner_url;
      let avatarUrl = state.channel.avatar_url;

      if (editBannerData) {
        const resp = await fetch(editBannerData);
        const blob = await resp.blob();
        const path = `${state.user.id}/banner_${Date.now()}.jpg`;
        await supabaseClient.storage.from('thumbnails').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
        bannerUrl = supabaseClient.storage.from('thumbnails').getPublicUrl(path).data.publicUrl;
      }

      if (editAvatarData) {
        const resp = await fetch(editAvatarData);
        const blob = await resp.blob();
        const path = `${state.user.id}/avatar_${Date.now()}.jpg`;
        await supabaseClient.storage.from('thumbnails').upload(path, blob, { contentType: 'image/jpeg', upsert: true });
        avatarUrl = supabaseClient.storage.from('thumbnails').getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabaseClient.from('channels').update({
        name,
        username: finalUsername,
        category: editCategory.value,
        description: editDesc.value.trim(),
        language: editLanguage.value,
        currency: editCurrency.value,
        region: editRegion.value,
        banner_url: bannerUrl,
        avatar_url: avatarUrl
      }).eq('id', state.channel.id);

      if (error) throw error;

      await loadUserChannel();
      editChannelPage.classList.remove('open');
      showToast('✅ Channel updated!');
      updateUI();
    } catch (err) {
      showToast('❌ ' + err.message);
    }

    editChannelSaveBtn.disabled = false;
    editChannelSaveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
  });
}

// ==================== CHANNEL VIEW ====================
async function openChannelView(username) {
  const ch = state.allChannels.find(c => c.username === username);
  if (!ch) { showToast('Channel not found'); return; }

  const { data: chVideos } = await supabaseClient
    .from('videos')
    .select('*')
    .eq('channel_username', username)
    .order('created_at', { ascending: false });

  const videos = chVideos || [];
  const bannerHTML = ch.banner_url ? `<img src="${ch.banner_url}">` : '';
  const avatarHTML = ch.avatar_url ? `<img src="${ch.avatar_url}">` : (ch.avatar_emoji || '🎬');

  const isSubscribed = state.subscriptions.includes(ch.id);
  const isMine = ch.owner_id === state.user?.id;

  channelViewHeaderTitle.textContent = ch.name;
  channelViewBody.innerHTML = `
    <div class="channel-banner-display">${bannerHTML}</div>
    <div class="channel-view-info">
      <div class="channel-view-avatar">${avatarHTML}</div>
      <div class="channel-view-name"><i class="fas fa-check-circle"></i> ${escapeHTML(ch.name)}</div>
      <div class="channel-view-handle">${escapeHTML(ch.username)} · ${escapeHTML(ch.category || '')}</div>
      <div class="channel-view-stats">
        <span><strong>${ch.subscribers_count || 0}</strong> subscribers</span>
        <span><strong>${videos.length}</strong> videos</span>
      </div>
      ${ch.description ? `<div class="channel-view-desc">${escapeHTML(ch.description)}</div>` : ''}
      ${!isMine ? `
        <div class="channel-view-subscribe-row">
          <button class="subscribe-btn ${isSubscribed ? 'subscribed' : ''}" id="channelSubBtn" style="flex:1;justify-content:center;padding:12px;font-size:0.85rem;">
            ${isSubscribed ? '<i class="fas fa-check"></i> Subscribed' : '<i class="fas fa-plus"></i> Subscribe'}
          </button>
        </div>
      ` : ''}
    </div>
    <div class="channel-view-videos-title"><i class="fas fa-video"></i> Videos</div>
    <div class="channel-video-grid" id="channelVideoGrid"></div>
  `;

  const grid = document.getElementById('channelVideoGrid');
  if (videos.length === 0) {
    grid.innerHTML = '<div class="no-comments" style="padding:30px;">No videos yet.</div>';
  } else {
    videos.forEach(vid => {
      const card = document.createElement('div');
      card.className = 'video-card';
      const thumbHTML = vid.thumbnail_url
        ? `<img src="${vid.thumbnail_url}" style="width:100%;height:100%;object-fit:cover;">`
        : `<i class="fas fa-play-circle" style="font-size:3.8rem;color:#ffffffcc;"></i>`;
      const isMineVid = vid.owner_id === state.user?.id;
      const menuBtnHTML = isMineVid ? `<button class="my-video-menu-btn" data-mymenu="${vid.id}"><i class="fas fa-ellipsis-v"></i></button>` : '';
      
      card.innerHTML = `
        <div class="thumbnail-box">
          ${thumbHTML}
          <span class="duration-badge">${vid.duration || '0:00'}</span>
          ${menuBtnHTML}
        </div>
        <div class="video-details">
          <div class="video-meta">
            <div class="video-title">${escapeHTML(vid.title)}</div>
            <div class="video-stats">
              <span><i class="fas fa-eye"></i> ${vid.views || 0}</span>
              <span><i class="fas fa-thumbs-up"></i> ${vid.likes || 0}</span>
            </div>
          </div>
        </div>
      `;
      card.addEventListener('click', (e) => {
        if (e.target.closest('.my-video-menu-btn')) {
          e.stopPropagation();
          openVideoActions(vid);
          return;
        }
        openWatchPage(vid);
      });
      grid.appendChild(card);
    });
  }

  document.getElementById('channelSubBtn')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    if (btn.classList.contains('subscribed')) {
      await supabaseClient.from('subscriptions').delete().eq('user_id', state.user.id).eq('channel_id', ch.id);
      const newCount = Math.max(0, (ch.subscribers_count || 1) - 1);
      await supabaseClient.from('channels').update({ subscribers_count: newCount }).eq('id', ch.id);
      btn.classList.remove('subscribed');
      btn.innerHTML = '<i class="fas fa-plus"></i> Subscribe';
      state.subscriptions = state.subscriptions.filter(id => id !== ch.id);
      showToast('Unsubscribed');
    } else {
      await supabaseClient.from('subscriptions').insert({ user_id: state.user.id, channel_id: ch.id });
      const newCount = (ch.subscribers_count || 0) + 1;
      await supabaseClient.from('channels').update({ subscribers_count: newCount }).eq('id', ch.id);
      btn.classList.add('subscribed');
      btn.innerHTML = '<i class="fas fa-check"></i> Subscribed';
      state.subscriptions.push(ch.id);
      showToast('✅ Subscribed!');
    }
    await loadFeedFromSupabase();
  });

  channelViewPage.classList.add('open');
}

if (channelViewBackBtn) channelViewBackBtn.addEventListener('click', () => channelViewPage.classList.remove('open'));

// ==================== NOTIFICATIONS ====================
async function loadNotifications() {
  if (!state.user) return;
  const { data } = await supabaseClient
    .from('notifications')
    .select('*')
    .eq('user_id', state.user.id)
    .order('created_at', { ascending: false })
    .limit(50);
  state.notifications = data || [];
  if (notifDot) notifDot.style.display = state.notifications.length > 0 ? 'block' : 'none';
}

if (notifBtn) {
  notifBtn.addEventListener('click', () => {
    if (!state.user) { showToast('Login first'); return; }
    renderNotifications();
    notificationsPage.classList.add('open');
  });
}

if (notificationsBackBtn) notificationsBackBtn.addEventListener('click', () => notificationsPage.classList.remove('open'));

function renderNotifications() {
  if (!notificationsBody) return;
  if (state.notifications.length === 0) {
    notificationsBody.innerHTML = '<div class="no-notif">No notifications yet</div>';
    return;
  }
  notificationsBody.innerHTML = state.notifications.map(n => `
    <div class="notif-item">
      <div class="notif-icon"><i class="fas fa-heart"></i></div>
      <div class="notif-text">${escapeHTML(n.message)}</div>
      <div class="notif-time">${new Date(n.created_at).toLocaleString()}</div>
    </div>
  `).join('');
}

// ==================== PROFILE / UI ====================
function updateUI() {
  if (state.loggedIn) {
    if (drawerUserEmail) drawerUserEmail.textContent = state.email;
    if (profileEmail) profileEmail.textContent = state.email;
    if (profileName) profileName.textContent = state.channel ? state.channel.name : 'ForTube User';
    if (settingsEmail) settingsEmail.textContent = state.email;
    if (settingsChannelStatus) settingsChannelStatus.textContent = state.channel ? state.channel.name : 'None';

    if (state.channel && channelStatusArea) {
      const avatarHTML = state.channel.avatar_url
        ? `<img src="${state.channel.avatar_url}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;">`
        : `<div style="width:48px;height:48px;border-radius:50%;background:#e1f0fa;display:flex;align-items:center;justify-content:center;font-size:1.6rem;">${state.channel.avatar_emoji || '🎬'}</div>`;

      channelStatusArea.innerHTML = `
        <div class="channel-stats-row">
          <div style="display:flex;align-items:center;gap:10px;">
            ${avatarHTML}
            <div style="text-align:left;">
              <div style="font-weight:800;color:#0b4a5e;">${escapeHTML(state.channel.name)}</div>
              <div style="font-size:0.7rem;color:#4d7e8c;">${escapeHTML(state.channel.username)}</div>
            </div>
          </div>
        </div>
        <button class="edit-channel-btn" id="openEditChannelBtn"><i class="fas fa-edit"></i> Edit Channel</button>
      `;
    } else if (channelStatusArea) {
      channelStatusArea.innerHTML = `<button class="no-channel-btn" id="noChannelBtn"><i class="fas fa-plus-circle"></i> No Channel — Create one</button>`;
    }
  }

  renderRecentlyWatched();
  updateMonetizationUI();
}

function renderRecentlyWatched() {
  if (!recentlyWatched) return;
  if (state.recentlyWatchedList.length === 0) {
    recentlyWatched.innerHTML = `<i class="fas fa-clock" style="font-size:1.4rem;color:#a8c8d8;"></i><br>No recently watched videos.`;
  } else {
    recentlyWatched.innerHTML = state.recentlyWatchedList.map(t =>
      `<div style="padding:6px 0;border-bottom:1px solid #eef5fa;text-align:left;">${escapeHTML(t)}</div>`
    ).join('');
  }
}

// ==================== MONETIZATION ====================
async function updateMonetizationUI() {
  if (!state.channel) return;

  const { data: videos } = await supabaseClient
    .from('videos')
    .select('views')
    .eq('channel_id', state.channel.id);

  const totalViews = (videos || []).reduce((sum, v) => sum + (v.views || 0), 0);
  const subs = state.channel.subscribers_count || 0;
  const watchHours = Math.floor(totalViews * 0.5);

  if (viewsProgress) viewsProgress.textContent = `${totalViews}/1000`;
  if (watchProgress) watchProgress.textContent = `${watchHours}/4000`;
  if (subsProgress) subsProgress.textContent = `${subs}/1000`;

  const vDone = totalViews >= 1000;
  const wDone = watchHours >= 4000;
  const sDone = subs >= 1000;

  if (check1) check1.className = 'fas fa-check-circle ci-check' + (vDone ? '' : ' pending');
  if (check2) check2.className = 'fas fa-check-circle ci-check' + (wDone ? '' : ' pending');
  if (check3) check3.className = 'fas fa-check-circle ci-check' + (sDone ? '' : ' pending');

  const done = [vDone, wDone, sDone].filter(Boolean).length;
  if (progressFill) progressFill.style.width = (done / 3 * 100) + '%';

  if (done === 3 && verifyBtn) {
    verifyBtn.disabled = false;
    verifyBtn.classList.add('eligible');
    verifyBtn.textContent = '✅ Verify & Apply';
  } else if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.classList.remove('eligible');
    verifyBtn.textContent = `Not Eligible Yet (${done}/3)`;
  }
}

if (monetizationCard) {
  monetizationCard.addEventListener('click', () => {
    if (!state.channel) { showToast('Create channel first'); return; }
    monetizationPage.classList.add('open');
    updateMonetizationUI();
  });
}

if (monetizationBackBtn) monetizationBackBtn.addEventListener('click', () => monetizationPage.classList.remove('open'));

if (verifyBtn) {
  verifyBtn.addEventListener('click', () => {
    if (!verifyBtn.classList.contains('eligible')) return;
    eligibilityCard.style.display = 'none';
    monetizationApplyPage.style.display = 'block';
    monetizationEmail.value = state.email;
  });
}

if (submitMonetizationApplication) {
  submitMonetizationApplication.addEventListener('click', async () => {
    const email = monetizationEmail.value.trim();
    const file = verificationDocument.files[0];
    if (!email || !email.includes('@')) { showToast('Valid email'); return; }
    if (!file) { showToast('Document upload karein'); return; }

    submitMonetizationApplication.disabled = true;
    submitMonetizationApplication.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
      const docPath = `${state.user.id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabaseClient.storage.from('verification-documents').upload(docPath, file);
      if (uploadErr) throw uploadErr;

      const { error } = await supabaseClient.from('monetization_applications').insert({
        user_id: state.user.id,
        email,
        status: 'pending',
        document_path: docPath
      });
      if (error) throw error;

      applicationStatus.style.display = 'block';
      applicationStatus.style.background = '#e8f5ee';
      applicationStatus.style.color = '#0a6b3c';
      applicationStatus.style.padding = '15px';
      applicationStatus.style.borderRadius = '15px';
      applicationStatus.style.marginTop = '15px';
      applicationStatus.textContent = '✅ Application submitted!';
      showToast('🎉 Sent!');
    } catch (err) {
      showToast('❌ ' + err.message);
    }

    submitMonetizationApplication.disabled = false;
    submitMonetizationApplication.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Application';
  });
}

if (withdrawRevenueBtn) withdrawRevenueBtn.addEventListener('click', () => withdrawPage.classList.add('open'));
if (withdrawBackBtn) withdrawBackBtn.addEventListener('click', () => withdrawPage.classList.remove('open'));

document.getElementById('continueWithdrawBtn')?.addEventListener('click', () => {
  const country = document.getElementById('withdrawCountry').value;
  if (!country) { showToast('Select country'); return; }
  document.getElementById('withdrawCountryText').textContent = 'Bank info for ' + country;
  document.getElementById('withdrawBankForm').style.display = 'block';
  document.getElementById('continueWithdrawBtn').parentElement.style.display = 'none';
});

document.getElementById('submitWithdrawBtn')?.addEventListener('click', () => {
  const holder = document.getElementById('withdrawAccountHolder').value.trim();
  const bank = document.getElementById('withdrawBankName').value.trim();
  const acc = document.getElementById('withdrawAccountNumber').value.trim();
  const amount = parseFloat(document.getElementById('withdrawAmount').value);
  if (!holder || !bank || !acc || !amount || amount <= 0) { showToast('All fields required'); return; }
  const status = document.getElementById('withdrawStatus');
  status.style.display = 'block';
  status.style.background = '#e8f5ee';
  status.style.color = '#0a6b3c';
  status.style.padding = '15px';
  status.style.borderRadius = '15px';
  status.style.marginTop = '15px';
  status.textContent = `✅ Withdrawal of $${amount.toFixed(2)} sent!`;
  showToast('💰 Sent!');
});

// ==================== DRAWER ====================
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', () => {
    drawer.classList.add('open');
    drawerOverlay.classList.add('open');
  });
}

function closeDrawer() {
  if (drawer) drawer.classList.remove('open');
  if (drawerOverlay) drawerOverlay.classList.remove('open');
}

if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

document.querySelectorAll('.drawer-link').forEach(link => {
  link.addEventListener('click', function () {
    const type = this.dataset.drawer;
    closeDrawer();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('.nav-item[data-tab="home"]').classList.add('active');

    if (type === 'home') { currentFilter = 'home'; renderFeed('', 'home'); }
    else if (type === 'gaming') { currentFilter = 'gaming'; renderFeed('', 'gaming'); }
    else if (type === 'sports') { currentFilter = 'sports'; renderFeed('', 'sports'); }
    else if (type === 'yourvideos') { currentFilter = 'yourvideos'; renderFeed('', 'yourvideos'); }
    else if (type === 'trending') { currentFilter = 'trending'; renderFeed('', 'trending'); }
    else if (type === 'music') { currentFilter = 'music'; renderFeed('', 'music'); }
    else if (type === 'news') { currentFilter = 'news'; renderFeed('', 'news'); }
    else if (type === 'settings') { settingsPage.classList.add('open'); }
    else if (type === 'help') { supportPage.classList.add('open'); }
  });
});

// ==================== NAV ====================
if (navYou) {
  navYou.addEventListener('click', () => {
    if (!state.loggedIn) { showToast('Login first'); return; }
    profilePanel.classList.add('open');
    updateUI();
  });
}

if (profileBackBtn) profileBackBtn.addEventListener('click', () => profilePanel.classList.remove('open'));

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', function () {
    if (this.id === 'navYou') return;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    this.classList.add('active');
    const tab = this.dataset.tab;
    if (tab === 'home') { currentFilter = 'home'; renderFeed('', 'home'); showToast('🏠 Home'); }
    else if (tab === 'shorts') { currentFilter = 'shorts'; renderFeed('', 'shorts'); showToast('⚡ Shorts'); }
    else if (tab === 'subs') {
      currentFilter = 'subs';
      renderFeed('', 'subs');
      openSubscriptions();
    }
  });
});

// ==================== SETTINGS ====================
if (settingsBackBtn) settingsBackBtn.addEventListener('click', () => settingsPage.classList.remove('open'));
if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    if (!state.loggedIn) { showToast('Login first'); return; }
    settingsPage.classList.add('open');
  });
}

if (settingsLanguage) settingsLanguage.addEventListener('change', () => { state.preferences.language = settingsLanguage.value; showToast('🌐 Language: ' + settingsLanguage.value); });
if (settingsRegion) settingsRegion.addEventListener('change', () => { state.preferences.region = settingsRegion.value; showToast('📍 Region: ' + settingsRegion.value); });
if (settingsCurrency) settingsCurrency.addEventListener('change', () => { state.preferences.currency = settingsCurrency.value; showToast('💱 Currency: ' + settingsCurrency.value); });
if (settingsQuality) settingsQuality.addEventListener('change', () => { state.preferences.quality = settingsQuality.value; showToast('🎬 Quality: ' + settingsQuality.value); });

if (toggleSubtitles) toggleSubtitles.addEventListener('click', () => { toggleSubtitles.classList.toggle('active'); showToast(toggleSubtitles.classList.contains('active') ? 'Subtitles ON' : 'Subtitles OFF'); });
if (toggleRestricted) toggleRestricted.addEventListener('click', () => { toggleRestricted.classList.toggle('active'); showToast(toggleRestricted.classList.contains('active') ? 'Restricted ON' : 'Restricted OFF'); });
if (toggleHistory) toggleHistory.addEventListener('click', () => { toggleHistory.classList.toggle('active'); showToast(toggleHistory.classList.contains('active') ? 'History ON' : 'History OFF'); });
if (toggleNotifications) toggleNotifications.addEventListener('click', () => { toggleNotifications.classList.toggle('active'); showToast(toggleNotifications.classList.contains('active') ? 'Notifications ON' : 'Notifications OFF'); });

if (clearCacheBtn) {
  clearCacheBtn.addEventListener('click', () => {
    indexedDB.deleteDatabase(IDB_NAME);
    idbInstance = null;
    showToast('🧹 Cache cleared');
  });
}

if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete your account?')) {
      showToast('⚠️ Contact: syedtechnical63@gmail.com');
    }
  });
}

// ==================== SEARCH ====================
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    const q = searchInput.value.trim();
    renderFeed(q, currentFilter);
  });
}
if (searchInput) {
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchBtn.click(); });
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    if (!q) renderFeed('', currentFilter);
    else if (q.length >= 2) renderFeed(q, currentFilter);
  });
}

// ==================== MIC ====================
if (micBtn) {
  micBtn.addEventListener('click', () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('🎤 Voice not supported'); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SR();
    recog.lang = 'en-US';
    micBtn.classList.add('recording');
    showToast('🎤 Listening...');
    recog.start();
    recog.onresult = e => {
      searchInput.value = e.results[0][0].transcript;
      searchBtn.click();
    };
    recog.onerror = () => showToast('🎤 Try again');
    recog.onend = () => micBtn.classList.remove('recording');
  });
}

// ==================== MISC ====================
if (alertCloseBtn) alertCloseBtn.addEventListener('click', () => alertPopup.classList.remove('active'));

// ==================== INIT ====================
checkSession();

setInterval(() => {
  if (state.loggedIn && watchPage && !watchPage.classList.contains('open')) {
    loadFeedFromSupabase();
    loadNotifications();
  }
}, 30000);
