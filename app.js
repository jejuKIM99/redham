const { createApp } = Vue;
const { createRouter, createWebHistory } = VueRouter;

// 라우터 설정 (Vue 3 방식)
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home Page</div>' }, meta: { title: 'Red Line Awards Home', description: 'Discover award-winning movies and recommendations on Red Line Awards.' } },
    { path: '/about/sub1', component: { template: '<div>About Sub1</div>' }, meta: { title: 'What is RLA', description: 'Learn about Red Line Awards, a movie awards blog introducing a wide range of films.' } },
    { path: '/about/sub2', component: { template: '<div>About Sub2</div>' }, meta: { title: 'Site Tutorial', description: 'A tutorial on how to navigate and use the Red Line Awards website.' } },
    { path: '/award/sub1', component: { template: '<div>Award Sub1</div>' }, meta: { title: 'Movie of the Month', description: 'Explore monthly award-winning movies on Red Line Awards.' } },
    { path: '/award/sub2', component: { template: '<div>Award Sub2</div>' }, meta: { title: 'Movie of the Year', description: 'Discover yearly award-winning movies on Red Line Awards.' } },
    { path: '/award/sub3', component: { template: '<div>Award Sub3</div>' }, meta: { title: 'Nominee List', description: 'Vote for your favorite movie nominees on Red Line Awards.' } },
    { path: '/list/sub1', component: { template: '<div>List Sub1</div>' }, meta: { title: 'Soundtrack', description: 'Check out movie soundtracks featured on Red Line Awards.' } },
    { path: '/list/sub2', component: { template: '<div>List Sub2</div>' }, meta: { title: 'Master\'s Pick', description: 'Explore curated movie recommendations by the Master on Red Line Awards.' } },
    { path: '/list/sub3', component: { template: '<div>List Sub3</div>' }, meta: { title: 'Editor\'s Pick', description: 'Explore curated movie recommendations by the Editors on Red Line Awards.' } },
    { path: '/board/sub1', component: { template: '<div>Board Sub1</div>' }, meta: { title: 'Notices Board', description: 'Stay updated with the latest notices on Red Line Awards.' } },
    { path: '/board/sub2', component: { template: '<div>Board Sub2</div>' }, meta: { title: 'Event Board', description: 'Find out about events on Red Line Awards.' } },
    { path: '/board/sub3', component: { template: '<div>Board Sub3</div>' }, meta: { title: 'Movie Discussion', description: 'Join movie discussions on Red Line Awards.' } },
  ]
});
// 메타 태그 수동 관리
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Red Line Awards - Movie Awards Blog';
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', to.meta.description || 'Red Line Awards is a movie awards blog that introduces a wide range of films, including older movies, and provides fair evaluations and a user-friendly experience.');
  }
  next();
});
const app = createApp({
  data() {
    return {
      ld: 0,
      cp: 'home',
      mainSliderImages: [],
      rlaRecommendations: [],
      currentMovie: {},
      currentStills: [],
      boardData: {
        boardSub1: [],
        boardSub2: [],
        boardSub3: [],
        listSub1: []
      },
      currentBoardPage: {
        boardSub1: 1,
        boardSub2: 1,
        boardSub3: 1,
        listSub1: 1
      },
      boardItemsPerPage: 10,
      activePost: {},
      activeBoard: '',
      showPostView: false,
      newComment: "",
      replyingTo: null,
      newReply: '',
      selectedFilter: {
        awardSub1: 'Newest',
        awardSub2: 'Newest',
        awardSub3: 'Month',
        boardSub1: 'Newest',
        boardSub2: 'Newest',
        listSub1: 'Newest',
        listSub2: 'Newest',
        listSub3: 'Newest'
      },
      currentPage: {
        awardSub1: 1,
        awardSub2: 1,
        awardSub3: 1,
        listSub2: 1,
        listSub3: 1
      },
      itemsPerPage: 20,
      awardData: {
        awardSub1: [],
        awardSub2: [],
        awardSub3: []
      },
      listData: {
        listSub2: [],
        listSub3: []
      },
      searchQuery: {
        listSub1: '',
        listSub2: '',
        listSub3: '',
        boardSub1: '',
        boardSub2: '',
        boardSub3: ''
      },
      randomYearList: [],
      randomMonthList: [],
      supabase: null,
      nowPlayingMovies: [],
      clientIP: "",
      activeMovie: {},
      showMovieDetail: false,
      isMainContentLoaded: false,
      realtimeChannel: null,
      showChatWindow: false,
      chatSession: null,
      chatMessages: [],
      newMessage: '',
      chatRealtimeChannel: null,
      hasUnreadMessages: false,
      leftBannerImage: '',
      rightBannerImage: '',
      showNomineeDetail: false,
      activeNominee: {},
      voteRating: 5,
      voteMessage: '',
      lastRefreshedTime: '',
      showWarningModal: false,
      hasSeenNomineeModal: false,
      editors: [],
      selectedEditor: ''
    }
  },
  computed: {
    sortedItems() {
      return {
        awardSub1: this.sortItems(this.awardData.awardSub1, this.selectedFilter.awardSub1, { dateField: 'award_date', rateField: 'rating' }, this.searchQuery.awardSub1 || ''),
        awardSub2: this.sortItems(this.awardData.awardSub2, this.selectedFilter.awardSub2, { dateField: 'award_date', rateField: 'rating' }, this.searchQuery.awardSub2 || ''),
        awardSub3: this.sortItems(this.awardData.awardSub3, this.selectedFilter.awardSub3, { dateField: 'created_at', rateField: 'rating' }, this.searchQuery.awardSub3 || ''),
        listSub2: this.sortItems(this.listData.listSub2, this.selectedFilter.listSub2, { dateField: 'created_at', viewsField: 'views' }, this.searchQuery.listSub2 || ''),
        listSub3: this.sortItems(this.listData.listSub3, this.selectedFilter.listSub3, { dateField: 'created_at', viewsField: 'views' }, this.searchQuery.listSub3 || '', this.selectedEditor)
      }
    },
    pagedItems() {
      return {
        awardSub1: this.paginate(this.sortedItems.awardSub1, this.currentPage.awardSub1, this.itemsPerPage),
        awardSub2: this.paginate(this.sortedItems.awardSub2, this.currentPage.awardSub2, this.itemsPerPage),
        awardSub3: this.paginate(this.sortedItems.awardSub3, this.currentPage.awardSub3, this.itemsPerPage),
        listSub2: this.paginate(this.sortedItems.listSub2, this.currentPage.listSub2, this.itemsPerPage),
        listSub3: this.paginate(this.sortedItems.listSub3, this.currentPage.listSub3, this.itemsPerPage)
      }
    },
    totalPages() {
      return {
        awardSub1: Math.ceil(this.sortedItems.awardSub1.length / this.itemsPerPage),
        awardSub2: Math.ceil(this.sortedItems.awardSub2.length / this.itemsPerPage),
        awardSub3: Math.ceil(this.sortedItems.awardSub3.length / this.itemsPerPage),
        listSub2: Math.ceil(this.sortedItems.listSub2.length / this.itemsPerPage),
        listSub3: Math.ceil(this.sortedItems.listSub3.length / this.itemsPerPage)
      }
    },
    sortedBoard() {
      return {
        boardSub1: this.filterAndSortBoardPosts(this.boardData.boardSub1, this.selectedFilter.boardSub1, this.searchQuery.boardSub1 || ''),
        boardSub2: this.filterAndSortBoardPosts(this.boardData.boardSub2, this.selectedFilter.boardSub2, this.searchQuery.boardSub2 || ''),
        boardSub3: this.filterAndSortBoardPosts(this.boardData.boardSub3, 'Updated', this.searchQuery.boardSub3 || ''),
        listSub1: this.filterAndSortBoardPosts(this.boardData.listSub1, this.selectedFilter.listSub1, this.searchQuery.listSub1 || '')
      }
    },
    pagedBoard() {
      return {
        boardSub1: this.paginate(this.sortedBoard.boardSub1, this.currentBoardPage.boardSub1, this.boardItemsPerPage),
        boardSub2: this.paginate(this.sortedBoard.boardSub2, this.currentBoardPage.boardSub2, this.boardItemsPerPage),
        boardSub3: this.paginate(this.sortedBoard.boardSub3, this.currentBoardPage.boardSub3, this.boardItemsPerPage),
        listSub1: this.paginate(this.sortedBoard.listSub1, this.currentBoardPage.listSub1, this.boardItemsPerPage)
      }
    },
    totalBoardPages() {
      return {
        boardSub1: Math.ceil(this.sortedBoard.boardSub1.length / this.boardItemsPerPage),
        boardSub2: Math.ceil(this.sortedBoard.boardSub2.length / this.boardItemsPerPage),
        boardSub3: Math.ceil(this.sortedBoard.boardSub3.length / this.boardItemsPerPage),
        listSub1: Math.ceil(this.sortedBoard.listSub1.length / this.boardItemsPerPage)
      }
    },
    topLevelComments() {
      return this.activePost.comments.filter(c => !c.parent_id);
    }
  },
  methods: {
    getMetaTitle() {
      const route = router.options.routes.find(r => r.path === this.$route.path);
      return route ? route.meta.title : 'Red Line Awards - Movie Awards Blog';
    },
    getMetaDescription() {
      const route = router.options.routes.find(r => r.path === this.$route.path);
      return route ? route.meta.description : 'Red Line Awards is a movie awards blog that introduces a wide range of films, including older movies, and provides fair evaluations and a user-friendly experience.';
    },
    getMovieImageUrl() {
      if (this.cp === 'listSub2' || this.cp === 'listSub3') {
        return this.activeMovie.poster_url;
      } else {
        return this.activeMovie.poster_url;
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    resetSidebannerPosition() {
      const leftSidebanner = document.getElementById('left-sidebanner');
      const rightSidebanner = document.getElementById('right-sidebanner');
      if (leftSidebanner) {
        leftSidebanner.style.bottom = 'max(20vh,10rem)';
      }
      if (rightSidebanner) {
        rightSidebanner.style.bottom = 'max(20vh,10rem)';
      }
    },
    async enBtn() {
      gsap.to("#intro-overlay", {
        duration: 1,
        opacity: 0,
        onComplete: async () => {
          document.getElementById("intro-overlay").style.display = "none";
          document.getElementById("main-content").style.display = "block";
          if (!this.isMainContentLoaded) {
            await this.fetchMainSliderImages();
            await this.fetchRlaRecommendations();
            await this.fetchNotices();
            await this.fetchEvents();
            await this.fetchDiscussions();
            await this.fetchSoundtrack();
            await this.fetchMastersPick();
            await this.fetchEditors();
            await this.fetchEditorsPick();
            await this.fetchNowPlayingMovies();
            await this.fetchMovieAwards();
            await this.fetchNominees();
            await this.fetchSideBanners();
            this.isMainContentLoaded = true;
          }
          this.$nextTick(() => { this.initHM(); });
        }
      });
    },
    togS(e) {
      e.stopPropagation();
      const hamb = document.getElementById("hamburger");
      const side = document.getElementById("sidebar");
      const sideOvr = document.getElementById("sidebar-overlay");
      hamb.classList.toggle("open");
      side.classList.toggle("open");
      sideOvr.style.display = side.classList.contains("open") ? "block" : "none";
    },
    hidS() {
      const hamb = document.getElementById("hamburger");
      const side = document.getElementById("sidebar");
      const sideOvr = document.getElementById("sidebar-overlay");
      hamb.classList.remove("open");
      side.classList.remove("open");
      sideOvr.style.display = "none";
    },
    clsNav() {
      const nav = document.getElementById("navbar");
      const toggleBtn = document.getElementById("nav-toggle");
      if (nav.classList.contains("open")) {
        gsap.to(nav, { duration: 0.3, height: 44, onComplete: () => { nav.classList.remove("open"); toggleBtn.textContent = "▼"; } });
        gsap.to("#nav-dropdown", { duration: 0.3, opacity: 0 });
      }
    },
    navTog(e) {
      e.stopPropagation();
      const nav = document.getElementById("navbar");
      const toggleBtn = document.getElementById("nav-toggle");
      if (nav.classList.contains("open")) {
        gsap.to(nav, { duration: 0.3, height: 44, onComplete: () => { nav.classList.remove("open"); toggleBtn.textContent = "▼"; } });
        gsap.to("#nav-dropdown", { duration: 0.3, opacity: 0 });
      } else {
        nav.classList.add("open");
        gsap.to(nav, { duration: 0.3, height: 340 });
        gsap.to("#nav-dropdown", { duration: 0.3, opacity: 1 });
        toggleBtn.textContent = "▲";
      }
    },
    async fetchMainSliderImages() {
      let { data, error } = await this.supabase.from('main_slider').select('image_url');
      if (error) {
        console.error("Fetch Main Slider Images Error:", error);
      } else {
        this.mainSliderImages = data.map(item => item.image_url);
      }
    },
    async fetchRlaRecommendations() {
      let { data, error } = await this.supabase.from('rla_recommendations').select('*');
      if (error) {
        console.error("Fetch RLA Recommendations Error:", error);
      } else {
        this.rlaRecommendations = data;
      }
    },
    async fetchRlaStills(movieId) {
      let { data, error } = await this.supabase.from('rla_stills').select('still_url').eq('movie_id', movieId);
      if (error) {
        console.error("Fetch RLA Stills Error:", error);
      } else {
        this.currentStills = data.map(item => item.still_url);
      }
    },
    async showExpanded(movieId) {
      const movie = this.rlaRecommendations.find(m => m.id === movieId);
      if (!movie) return;
      this.currentMovie = movie;
      await this.fetchRlaStills(movieId);
      document.getElementById("movie-grid").style.display = "none";
      document.getElementById("movie-expanded").style.display = "block";
      gsap.fromTo("#movie-expanded-wrapper", { scaleX: 0, opacity: 0, transformOrigin: "left center" }, { duration: 0.5, scaleX: 1, opacity: 1, ease: "power2.out" });
      this.$nextTick(() => {
        if (this.mSwiper) {
          this.mSwiper.destroy(true, true);
        }
        this.mSwiper = new Swiper(".movie-slider", {
          loop: true,
          autoplay: { delay: 3000, disableOnInteraction: false },
          navigation: { nextEl: ".movie-slider-next", prevEl: ".movie-slider-prev" },
          pagination: { el: ".movie-slider-pagination", clickable: true },
          observer: true,
          observeParents: true
        });
      });
    },
    clsExp() {
      gsap.to("#movie-expanded-wrapper", { duration: 0.5, scaleX: 0, opacity: 0, ease: "power2.in", onComplete: () => {
        document.getElementById("movie-expanded").style.display = "none";
        document.getElementById("movie-grid").style.display = "flex";
        if (this.mSwiper) {
          this.mSwiper.destroy(true, true);
          this.mSwiper = null;
        }
      } });
    },
    chPg(path) {
      this.clsNav();
      const newCp = path.replace('/', '').replace('/', '');
      if (this.cp === newCp) return;
      gsap.to("#page-container", {
        duration: 0.5,
        scale: 0,
        transformOrigin: "center center",
        ease: "power1.in",
        onComplete: () => {
          this.$router.push(path).then(() => {
            this.cp = newCp;
            this.$nextTick(() => {
              if (this.cp === 'home') {
                this.initHM();
              }
              gsap.fromTo("#page-container", {
                scale: 0,
                transformOrigin: "center center"
              }, {
                duration: 0.5,
                scale: 1,
                ease: "power1.out"
              });
              window.scrollTo(0, 0);
              this.resetSidebannerPosition();
            });
          });
        }
      });
    },
    initHM() {
      this.$nextTick(() => {
        new Swiper("#main-slider", {
          slidesPerView: 1,
          loop: true,
          autoplay: { delay: 5000 },
          navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
            renderBullet: function (index, className) {
              return '<span class="' + className + '"></span>';
            }
          }
        });
      });
      const curDate = new Date();
      let yr = curDate.getFullYear();
      let mn = curDate.getMonth();
      if (mn === 0) { yr = yr - 1; mn = 12; }
      const fmn = mn < 10 ? `0${mn}` : mn;
      document.getElementById("award-date").innerHTML = `${yr}/${fmn}`;
      document.getElementById("award-year").innerHTML = curDate.getFullYear() - 1;
      this.fetchMovieAwards();
      this.initStillSlider();
      document.getElementById("view-more-btn").addEventListener("click", (e) => {
        e.preventDefault();
        this.navTog(e);
      });
    },
    fltCh(menu, flt) {
      const gridRef = this.$refs["grid_" + menu];
      gsap.to(gridRef, { duration: 0.3, opacity: 0, onComplete: () => { this.selectedFilter[menu] = flt; this.currentPage[menu] = 1; gsap.to(gridRef, { duration: 0.3, opacity: 1 }); } });
    },
    pgPr(menu) {
      if (this.currentPage[menu] > 1) {
        const gridRef = this.$refs["grid_" + menu];
        gsap.to(gridRef, { duration: 0.3, opacity: 0, onComplete: () => { this.currentPage[menu]--; gsap.to(gridRef, { duration: 0.3, opacity: 1 }); } });
      }
    },
    pgNx(menu) {
      if (this.currentPage[menu] < this.totalPages[menu]) {
        const gridRef = this.$refs["grid_" + menu];
        gsap.to(gridRef, { duration: 0.3, opacity: 0, onComplete: () => { this.currentPage[menu]++; gsap.to(gridRef, { duration: 0.3, opacity: 1 }); } });
      }
    },
    sortItems(arr, flt, options = {}, query = '', editorId = '') {
      let filtered = arr;
      if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(item => item.title.toLowerCase().includes(lowerQuery));
      }
      if (editorId) {
        filtered = filtered.filter(item => item.editor_id === editorId);
      }
      let sorted = [...filtered];
      const { dateField = 'created_at', rateField = 'rating', viewsField = 'views' } = options;
      if (flt === "Newest") {
        sorted.sort((a, b) => new Date(b[dateField]) - new Date(a[dateField]));
      } else if (flt === "Oldest") {
        sorted.sort((a, b) => new Date(a[dateField]) - new Date(b[dateField]));
      } else if (flt === "Rate") {
        sorted.sort((a, b) => parseFloat(b[rateField]) - parseFloat(a[rateField]));
      } else if (flt === "Views") {
        sorted.sort((a, b) => b[viewsField] - a[viewsField]);
      } else if (flt === "Month") {
        return arr.filter(item => item.award_category === "Movie of the Month");
      } else if (flt === "Year") {
        return arr.filter(item => item.award_category === "Movie of the Year");
      }
      return sorted;
    },
    paginate(arr, curPg, itemsPerPage) {
      const start = (curPg - 1) * itemsPerPage;
      return arr.slice(start, start + itemsPerPage);
    },
    filterAndSortBoardPosts(arr, flt, query) {
      let filtered = arr;
      if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = arr.filter(post => post.title.toLowerCase().includes(lowerQuery) || post.content.toLowerCase().includes(lowerQuery));
      }
      let sorted = [...filtered];
      if (flt === "Newest") {
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (flt === "Oldest") {
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (flt === "Views") {
        sorted.sort((a, b) => b.views - a.views);
      } else if (flt === "Updated") {
        sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      }
      return sorted;
    },
    boardFltCh(menu, flt) {
      let section = this.$refs[menu];
      if (section) {
        gsap.to(section, { duration: 0.3, opacity: 0, onComplete: () => { this.selectedFilter[menu] = flt; this.currentBoardPage[menu] = 1; gsap.to(section, { duration: 0.3, opacity: 1 }); } });
      } else {
        this.selectedFilter[menu] = flt;
        this.currentBoardPage[menu] = 1;
      }
    },
    boardPgPr(menu) {
      if (this.currentBoardPage[menu] > 1) {
        let section = this.$refs[menu];
        if (section) {
          gsap.to(section, { duration: 0.3, opacity: 0, onComplete: () => { this.currentBoardPage[menu]--; gsap.to(section, { duration: 0.3, opacity: 1 }); } });
        } else {
          this.currentBoardPage[menu]--;
        }
      }
    },
    boardPgNx(menu) {
      if (this.currentBoardPage[menu] < this.totalBoardPages[menu]) {
        let section = this.$refs[menu];
        if (section) {
          gsap.to(section, { duration: 0.3, opacity: 0, onComplete: () => { this.currentBoardPage[menu]++; gsap.to(section, { duration: 0.3, opacity: 1 }); } });
        } else {
          this.currentBoardPage[menu]++;
        }
      }
    },
    async openPostView(board, post) {
      this.activeBoard = board;
      this.activePost = JSON.parse(JSON.stringify(post));
      if (board === 'boardSub3') {
        const { data: comments, error } = await this.supabase
          .from('discussion_comments')
          .select('*')
          .eq('discussion_id', post.id);
        if (error) {
          console.error("Fetch Comments Error:", error);
        } else {
          this.activePost.comments = comments || [];
        }
      }
      this.newComment = "";
      this.replyingTo = null;
      this.newReply = '';
      this.showPostView = true;
      document.body.style.overflow = "hidden";
      this.$nextTick(() => {
        gsap.fromTo("#post-view-modal", { top: "100%" }, { duration: 0.5, top: "44px", ease: "power2.out" });
        this.applyHighlightStyle();
      });
      if (board === 'listSub1') {
        await this.supabase.from('soundtrack').update({ views: post.views + 1 }).eq('id', post.id);
        this.fetchSoundtrack();
      }
    },
    closePostView() {
      gsap.to("#post-view-modal", { duration: 0.5, top: "100%", ease: "power2.in", onComplete: () => { this.showPostView = false; document.body.style.overflow = ""; } });
    },
    async openMovieDetail(movie) {
      this.activeMovie = movie;
      this.showMovieDetail = true;
      document.body.style.overflow = "hidden";
      this.$nextTick(() => {
        gsap.fromTo("#movie-detail-modal", { top: "100%" }, { duration: 0.5, top: "44px", ease: "power2.out" });
        if (this.activeMovie.still_cuts && this.activeMovie.still_cuts.length > 0) {
          new Swiper(".still-slider", {
            loop: true,
            navigation: {
              nextEl: ".still-slider-next",
              prevEl: ".still-slider-prev",
            },
            pagination: {
              el: ".still-slider-pagination",
              clickable: true,
            },
          });
        }
        this.applyHighlightStyle();
      });
      if (this.cp === 'listSub2') {
        await this.supabase.from('masters_pick').update({ views: movie.views + 1 }).eq('id', movie.id);
        this.fetchMastersPick();
      } else if (this.cp === 'listSub3') {
        const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '{}');
        if (!viewedPosts[movie.id]) {
          await this.supabase.from('editors_pick').update({ views: movie.views + 1 }).eq('id', movie.id);
          viewedPosts[movie.id] = true;
          localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
          this.fetchEditorsPick();
        }
      }
    },
    closeMovieDetail() {
      gsap.to("#movie-detail-modal", { duration: 0.5, top: "100%", ease: "power2.in", onComplete: () => { this.showMovieDetail = false; document.body.style.overflow = ""; } });
    },
    generateUUID() {
      if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      } else {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        array[6] = (array[6] & 0x0f) | 0x40; // version 4
        array[8] = (array[8] & 0x3f) | 0x80; // variant 1
        const hex = [...array].map(b => b.toString(16).padStart(2, '0')).join('');
        return `${hex.substr(0,8)}-${hex.substr(8,4)}-${hex.substr(12,4)}-${hex.substr(16,4)}-${hex.substr(20,12)}`;
      }
    },
    getUniqueId(postId) {
      let uniqueIds = JSON.parse(localStorage.getItem('uniqueIds') || '{}');
      if (!uniqueIds[postId]) {
        uniqueIds[postId] = this.generateUUID();
        localStorage.setItem('uniqueIds', JSON.stringify(uniqueIds));
      }
      return uniqueIds[postId];
    },
    async submitComment() {
      if (this.newComment.trim() !== "") {
        if (this.activeBoard === 'boardSub3') {
          let discId = this.activePost.id;
          const uniqueId = this.getUniqueId(discId);
          const commentText = this.newComment;
          const { data, error } = await this.supabase
            .from('discussion_comments')
            .insert([{
              discussion_id: discId,
              comment_text: commentText,
              unique_id: uniqueId,
              created_at: new Date().toISOString()
            }])
            .select();
          if (error) {
            console.error("Insert Comment Error:", error);
          } else {
            await this.supabase
              .from('discussions')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', discId);
            this.newComment = "";
            const newComment = { ...data[0], text: data[0].comment_text };
            this.activePost.comments = [...this.activePost.comments, newComment];
            await this.fetchDiscussions();
          }
        }
      }
    },
    showReplyInput(parentId) {
      this.replyingTo = parentId;
    },
    async submitReply(parentId) {
      if (this.newReply.trim() !== "") {
        const discId = this.activePost.id;
        const uniqueId = this.getUniqueId(discId);
        const commentText = this.newReply;
        const { data, error } = await this.supabase
          .from('discussion_comments')
          .insert([{
            discussion_id: discId,
            comment_text: commentText,
            unique_id: uniqueId,
            parent_id: parentId,
            created_at: new Date().toISOString()
          }])
          .select();
        if (error) {
          console.error("Insert Reply Error:", error);
        } else {
          this.newReply = "";
          this.replyingTo = null;
          const newReply = { ...data[0], text: data[0].comment_text };
          this.activePost.comments = [...this.activePost.comments, newReply];
          await this.supabase
            .from('discussions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', discId);
          await this.fetchDiscussions();
        }
      }
    },
    getReplies(parentId) {
      return this.activePost.comments.filter(c => c.parent_id === parentId);
    },
    searchPosts(menu) {
      this.currentBoardPage[menu] = 1;
    },
    searchItems(menu) {
      this.currentPage[menu] = 1;
    },
    async fetchNotices() {
      let { data, error } = await this.supabase.from('notices').select('*');
      if (error) {
        console.error("Fetch Notices Error:", error);
      } else {
        this.boardData.boardSub1 = data.map(item => ({
          id: item.id,
          title: item.title,
          date: item.created_at,
          content: item.content
        }));
      }
    },
    async fetchEvents() {
      let { data, error } = await this.supabase.from('events').select('*');
      if (error) {
        console.error("Fetch Events Error:", error);
      } else {
        this.boardData.boardSub2 = data.map(item => ({
          id: item.id,
          title: item.title,
          date: item.created_at,
          content: item.content
        }));
      }
    },
    async fetchDiscussions() {
      let { data, error } = await this.supabase.from('discussions').select('*, discussion_comments(*)');
      if (error) {
        console.error("Fetch Discussions Error:", error);
      } else {
        this.boardData.boardSub3 = data.map(item => ({
          id: item.id,
          title: item.title,
          createdAt: item.created_at,
          updatedAt: item.updated_at || item.created_at,
          content: item.content,
          comments: item.discussion_comments.map(comment => ({
            ...comment,
            text: comment.comment_text
          })) || []
        }));
      }
    },
    async fetchSoundtrack() {
      let { data, error } = await this.supabase.from('soundtrack').select('*');
      if (error) {
        console.error("Fetch Soundtrack Error:", error);
      } else {
        this.boardData.listSub1 = data.map(item => ({
          id: item.id,
          title: item.title,
          date: item.created_at,
          content: item.content,
          views: item.views
        }));
      }
    },
    async fetchMastersPick() {
      let { data, error } = await this.supabase.from('masters_pick').select('*');
      if (error) {
        console.error("Fetch Master's Pick Error:", error);
      } else {
        this.listData.listSub2 = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.content,
          poster_url: item.poster_url,
          views: item.views,
          created_at: item.created_at,
          is_ad: item.is_ad
        }));
      }
    },
    async fetchEditors() {
      let { data, error } = await this.supabase.from('editors').select('id, name');
      if (error) {
        console.error("Fetch Editors Error:", error);
      } else {
        this.editors = data;
      }
    },
    async fetchEditorsPick() {
      let { data, error } = await this.supabase.from('editors_pick').select('*, editors(name)');
      if (error) {
        console.error("Fetch Editor's Pick Error:", error);
      } else {
        this.listData.listSub3 = data.map(item => ({
          id: item.id,
          editor_id: item.editor_id,
          editor_name: item.editors.name,
          title: item.title,
          description: item.content,
          poster_url: item.poster_url,
          views: item.views,
          created_at: item.created_at,
          is_ad: item.is_ad
        }));
      }
    },
    async fetchNowPlayingMovies() {
      this.nowPlayingMovies = [
        { id: 1, title: "Upcoming Service" },
      ];
      const list = document.getElementById("now-playing-list");
      list.innerHTML = "";
      this.nowPlayingMovies.forEach(movie => {
        const li = document.createElement("li");
        li.textContent = movie.title;
        list.appendChild(li);
      });
    },
    async fetchMovieAwards() {
      let { data: awards, error } = await this.supabase.from('movie_awards').select('*');
      if (error) {
        console.error("Fetch Movie Awards Error:", error);
      } else {
        this.awardData.awardSub1 = awards.filter(item => item.award_type.toLowerCase() === 'month')
          .map(item => ({ ...item, title: item.movie_title }));
        this.awardData.awardSub2 = awards.filter(item => item.award_type.toLowerCase() === 'year')
          .map(item => ({ ...item, title: item.movie_title }));
        this.randomMonthList = [...this.awardData.awardSub1].sort(() => Math.random() - 0.5);
        this.randomYearList = [...this.awardData.awardSub2].sort(() => Math.random() - 0.5);

        if (this.awardData.awardSub1.length > 0) {
          let latestMonth = this.awardData.awardSub1.reduce((prev, cur) => (new Date(cur.award_date) > new Date(prev.award_date) ? cur : prev));
          const section2PosterImg = document.querySelector('#section2 .award-poster-img');
          if (section2PosterImg) {
            section2PosterImg.style.backgroundImage = `url(${latestMonth.poster_url})`;
            section2PosterImg.style.backgroundSize = 'cover';
            section2PosterImg.style.backgroundPosition = 'center';
          }
          const section2Title = document.querySelector('#section2 .award-description h3');
          if (section2Title) {
            section2Title.textContent = latestMonth.movie_title;
          }
          const section2Desc = document.querySelector('#section2 .award-description p');
          if (section2Desc) {
            section2Desc.textContent = latestMonth.short_description;
          }
        }

        if (this.awardData.awardSub2.length > 0) {
          let latestYear = this.awardData.awardSub2.reduce((prev, cur) => (new Date(cur.award_date) > new Date(prev.award_date) ? cur : prev));
          const section3AwardPoster = document.querySelector('#section3 .award-poster');
          if (section3AwardPoster) {
            section3AwardPoster.style.backgroundImage = `url(${latestYear.poster_url})`;
            section3AwardPoster.style.backgroundSize = 'cover';
            section3AwardPoster.style.backgroundPosition = 'center';
          }
          const section3Title = document.querySelector('#section3 .award-description h3');
          if (section3Title) {
            section3Title.textContent = latestYear.movie_title;
          }
          const section3Desc = document.querySelector('#section3 .award-description p');
          if (section3Desc) {
            section3Desc.textContent = latestYear.short_description;
          }
          if (latestYear.still_cuts && Array.isArray(latestYear.still_cuts) && latestYear.still_cuts.length > 0) {
            const stillSlider = document.querySelector("#still-slider .continuous-slider.top");
            if (stillSlider) {
              let stills = latestYear.still_cuts;
              stillSlider.innerHTML = "";
              stills.forEach(cut => {
                let slideDiv = document.createElement("div");
                slideDiv.className = "slide still-slide";
                slideDiv.style.backgroundImage = `url(${cut})`;
                slideDiv.style.backgroundSize = 'cover';
                slideDiv.style.backgroundPosition = 'center';
                stillSlider.appendChild(slideDiv);
              });
              stills.forEach(cut => {
                let slideDiv = document.createElement("div");
                slideDiv.className = "slide still-slide";
                slideDiv.style.backgroundImage = `url(${cut})`;
                slideDiv.style.backgroundSize = 'cover';
                slideDiv.style.backgroundPosition = 'center';
                stillSlider.appendChild(slideDiv);
              });
            }
          }
        }
      }
    },
    async fetchNominees() {
      let { data: nominees, error } = await this.supabase.from('nominees').select('*');
      if (error) {
        console.error("Fetch Nominees Error:", error);
      } else {
        this.awardData.awardSub3 = nominees.map(item => ({ ...item, title: item.movie_title }));
      }
    },
    async fetchSideBanners() {
      let { data, error } = await this.supabase.from('sidebanner').select('sidebanner_image');
      if (error) {
        console.error("Fetch Side Banners Error:", error);
      } else {
        if (data.length > 0) {
          this.leftBannerImage = data[0].sidebanner_image;
        }
        if (data.length > 1) {
          this.rightBannerImage = data[1].sidebanner_image;
        }
      }
    },
    startLoading() {
      const updateProgress = () => {
        const resources = performance.getEntriesByType('resource');
        const totalResources = resources.length || 1;
        let loadedResources = resources.filter(r => r.responseEnd > 0).length;
        let progress = Math.min((loadedResources / totalResources) * 100, 100);
        document.getElementById("loading-percentage").textContent = `${Math.round(progress)}%`;
        document.getElementById("loading-bar").style.width = `${progress}%`;
        if (progress < 100) {
          requestAnimationFrame(updateProgress);
        }
      };
      requestAnimationFrame(updateProgress);
      window.onload = () => {
        document.getElementById("loading-percentage").textContent = "100%";
        document.getElementById("loading-bar").style.width = "100%";
        setTimeout(() => {
          document.getElementById("loading-overlay").style.display = "none";
          const bgVid = document.getElementById("bg-video");
          bgVid.play();
          gsap.fromTo("#slogan-container", { opacity: 0 }, { duration: 2, opacity: 1, ease: "power2.in" });
        }, 500);
      };
    },
    handlePosterMouseMove(e) {
      const poster = e.currentTarget;
      const rect = poster.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;
      const dx = (x - w / 2) / (w / 2);
      const dy = (y - h / 2) / (h / 2);
      const maxAngle = 15;
      const rotateY = -dx * maxAngle;
      const rotateX = dy * maxAngle;
      poster.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    },
    handlePosterMouseLeave(e) {
      const poster = e.currentTarget;
      poster.style.transform = 'rotateX(0deg) rotateY(0deg)';
    },
    initStillSlider() {
      const stillSlider = document.querySelector("#still-slider .continuous-slider.top");
      if (stillSlider) {
        stillSlider.style.animation = 'none';
        stillSlider.offsetHeight;
        stillSlider.style.animation = 'scroll 30s linear infinite';
      }
    },
    scrollToSection(sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        window.scrollTo({
          top: section.offsetTop - 60,
          behavior: 'smooth'
        });
      }
    },
    async toggleChatWindow() {
      if (this.showChatWindow) {
        this.closeChatWindow();
      } else {
        await this.openChatWindow();
      }
    },
    async openChatWindow() {
      this.showChatWindow = true;
      gsap.to("#chat-window", { duration: 0.3, scale: 1, opacity: 1, ease: "power2.out" });
      let { data: sessions, error } = await this.supabase.from('chat_sessions').select('*').eq('ip_address', this.clientIP);
      if (error) {
        console.error("Fetch Chat Session Error:", error);
        return;
      }
      if (sessions.length === 0) {
        const { data: newSession, error: insertError } = await this.supabase.from('chat_sessions').insert([{ ip_address: this.clientIP }]).select();
        if (insertError) {
          console.error("Insert Chat Session Error:", insertError);
          return;
        }
        this.chatSession = newSession[0];
        const initialMessage = "Please leave your inquiry, and an admin will reply after checking.";
        await this.supabase.from('chat_messages').insert([{ session_id: this.chatSession.id, message_text: initialMessage, is_admin: true }]);
      } else {
        this.chatSession = sessions[0];
      }
      await this.fetchChatMessages();
      await this.supabase.from('chat_sessions').update({ last_user_read_at: new Date().toISOString() }).eq('id', this.chatSession.id);
      this.scrollToBottom();
      this.setupRealtimeSubscription();
      this.hasUnreadMessages = false;
    },
    closeChatWindow() {
      gsap.to("#chat-window", { duration: 0.3, scale: 0, opacity: 0, ease: "power2.in", onComplete: () => {
        this.showChatWindow = false;
        if (this.chatRealtimeChannel) {
          this.supabase.removeChannel(this.chatRealtimeChannel);
          this.chatRealtimeChannel = null;
        }
      } });
    },
    async fetchChatMessages() {
      let { data: messages, error } = await this.supabase.from('chat_messages').select('*').eq('session_id', this.chatSession.id).order('created_at', { ascending: true });
      if (error) {
        console.error("Fetch Chat Messages Error:", error);
      } else {
        this.chatMessages = messages;
      }
    },
    setupRealtimeSubscription() {
      if (this.chatRealtimeChannel) {
        this.supabase.removeChannel(this.chatRealtimeChannel);
      }
      this.chatRealtimeChannel = this.supabase
        .channel(`chat-${this.chatSession.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${this.chatSession.id}` }, async payload => {
          this.chatMessages.push(payload.new);
          if (payload.new.is_admin) {
            if (this.showChatWindow) {
              await this.supabase.from('chat_sessions').update({ last_user_read_at: new Date().toISOString() }).eq('id', this.chatSession.id);
            } else {
              this.hasUnreadMessages = true;
            }
          }
          this.scrollToBottom();
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_sessions', filter: `id=eq.${this.chatSession.id}` }, payload => {
          this.chatSession = payload.new;
          if (payload.new.status === 'closed') {
            this.closeChatWindow();
          }
        })
        .subscribe();
    },
    async sendMessage() {
      if (this.newMessage.trim() === '') return;
      await this.supabase.from('chat_messages').insert([{ session_id: this.chatSession.id, message_text: this.newMessage, is_admin: false }]);
      this.newMessage = '';
      await this.supabase.from('chat_sessions').update({ last_user_read_at: new Date().toISOString() }).eq('id', this.chatSession.id);
      this.scrollToBottom();
    },
    isAutoEndMessage(message) {
      return message.is_admin && message.message_text === "If you have no further questions, press O; to continue, press X.";
    },
    async sendResponse(response) {
      await this.supabase.from('chat_messages').insert([{ session_id: this.chatSession.id, message_text: response, is_admin: false }]);
    },
    getMessageStatus(message) {
      if (message.is_admin) {
        return (this.chatSession.last_user_read_at && new Date(message.created_at) <= new Date(this.chatSession.last_user_read_at)) ? 'read' : 'unread';
      } else {
        return (this.chatSession.last_admin_read_at && new Date(message.created_at) <= new Date(this.chatSession.last_admin_read_at)) ? 'read' : 'unread';
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatMessages = this.$refs.chatMessages;
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      });
    },
    applyHighlightStyle() {
      const postBody = document.querySelector('.post-body');
      if (postBody) {
        let content = postBody.innerHTML;
        content = content.replace(/-.*?-/g, match => `<span class="highlighted">${match}</span>`);
        content = content.replace(/\*.*?\*/g, match => `<span class="highlightedSub">${match}</span>`);
        content = content.replace(/\『.*?\』/g, match => `<span class="highlightedVimp">${match}</span>`);
        content = content.replace(/\[.*?\]/g, match => `<span class="highlightedWord">${match}</span>`);
        content = content.replace(/\_.*?\_/g, match => `<span class="highlightedInfo">${match}</span>`);
        content = content.replace(/\「.*?\」/g, match => `<span class="highlightedImp">${match}</span>`);
        content = content.replace(/\$hr\$/g, '<hr>');
        postBody.innerHTML = content;
      }
    },
    async openNomineeDetail(nominee) {
      this.activeNominee = nominee;
      this.voteRating = 5;
      this.showNomineeDetail = true;
      document.body.style.overflow = "hidden";
      this.$nextTick(() => {
        gsap.fromTo("#nominee-detail-modal", { top: "100%" }, { duration: 0.5, top: "44px", ease: "power2.out" });
        this.updateSliderBackground();
      });
    },
    closeNomineeDetail() {
      gsap.to("#nominee-detail-modal", { duration: 0.5, top: "100%", ease: "power2.in", onComplete: () => {
        this.showNomineeDetail = false;
        document.body.style.overflow = "";
      } });
    },
    getNomineeRank(nominee) {
      const sortedNominees = this.sortItems(this.awardData.awardSub3, 'Rate', { rateField: 'rating' });
      const rank = sortedNominees.findIndex(n => n.id === nominee.id) + 1;
      return rank;
    },
    async submitVote() {
      const nomineeId = this.activeNominee.id;
      const ipAddress = this.clientIP;
      const rating = this.voteRating;

      let { data: existingVotes, error: fetchError } = await this.supabase
        .from('nominee_votes')
        .select('*')
        .eq('nominee_id', nomineeId)
        .eq('ip_address', ipAddress);

      if (fetchError) {
        console.error("Fetch Votes Error:", fetchError);
        this.voteMessage = "Error checking vote status.";
        return;
      }

      if (existingVotes.length > 0) {
        this.voteMessage = "You have already voted.";
        return;
      }

      let { data, error } = await this.supabase
        .from('nominee_votes')
        .insert([{ nominee_id: nomineeId, ip_address: ipAddress, rating: rating }])
        .select();

      if (error) {
        console.error("Insert Vote Error:", error);
        this.voteMessage = "Error submitting vote.";
      } else {
        this.voteMessage = "Vote submitted successfully.";
        let { data: updatedNominee, error: fetchError } = await this.supabase
          .from('nominees')
          .select('rating')
          .eq('id', nomineeId)
          .single();
        if (!fetchError) {
          this.activeNominee.rating = updatedNominee.rating;
        }
      }
    },
    async refreshNominees() {
      await this.fetchNominees();
      this.lastRefreshedTime = new Date().toLocaleTimeString();
    },
    setupNomineesRealtime() {
      this.nomineesChannel = this.supabase
        .channel('nominees-changes')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'nominees' }, payload => {
          const updatedNominee = payload.new;
          const index = this.awardData.awardSub3.findIndex(n => n.id === updatedNominee.id);
          if (index !== -1) {
            this.$set(this.awardData.awardSub3, index, { ...this.awardData.awardSub3[index], rating: updatedNominee.rating });
          }
          if (this.activeNominee && this.activeNominee.id === updatedNominee.id) {
            this.activeNominee.rating = updatedNominee.rating;
          }
        })
        .subscribe();
    },
    confirmWarning() {
      this.hasSeenNomineeModal = true;
      this.showWarningModal = false;
    },
    updateSliderBackground() {
      const slider = document.querySelector('.vote-slider');
      const value = ((this.voteRating - slider.min) / (slider.max - slider.min)) * 100;
      slider.style.background = `linear-gradient(to right, #e90000 0%, #e90000 ${value}%, #fff ${value}%, #fff 100%)`;
    }
  },
  watch: {
    cp(newVal) {
      if (newVal === 'awardSub3' && !this.hasSeenNomineeModal) {
        this.showWarningModal = true;
      }
    }
  },
  mounted() {
    this.supabase = supabase.createClient(
      "https://hthtzipxhfezjduxskzg.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0aHR6aXB4aGZlempkdXhza3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5MTE1MzQsImV4cCI6MjA1NzQ4NzUzNH0.e-SodT9c9kv6Gm4HytAjYoIvnOfQTvFBFzLTiGFaxwg"
    );
    fetch("https://api.ipify.org?format=json")
      .then(response => response.json())
      .then(data => { this.clientIP = data.ip; })
      .catch(err => console.error("IP Fetch Error:", err));
    this.startLoading();
    this.fetchSideBanners();
    const hamb = document.getElementById("hamburger");
    const sideOvr = document.getElementById("sidebar-overlay");
    hamb.addEventListener("click", (e) => { this.togS(e); });
    sideOvr.addEventListener("click", () => { this.hidS(); });
    document.addEventListener("click", (e) => {
      const side = document.getElementById("sidebar");
      if (side.classList.contains("open") && !side.contains(e.target) && !hamb.contains(e.target)) {
        this.hidS();
      }
      const nav = document.getElementById("navbar");
      if (nav.classList.contains("open") && !nav.contains(e.target)) {
        this.clsNav();
      }
    });
    this.realtimeChannel = this.supabase
      .channel('discussion-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'discussion_comments' }, payload => {
        this.fetchDiscussions();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'discussions' }, payload => {
        this.fetchDiscussions();
      })
      .subscribe();
    this.setupNomineesRealtime();
    this.refreshNominees();
  },
  beforeUnmount() {
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel);
    }
    if (this.chatRealtimeChannel) {
      this.supabase.removeChannel(this.chatRealtimeChannel);
    }
    if (this.nomineesChannel) {
      this.supabase.removeChannel(this.nomineesChannel);
    }
  }
});
app.use(router);
app.mount("#app");