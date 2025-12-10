import React, { useState } from 'react';
import './style/QuickActions.scss';

const IconUser = () => (
    <svg className="quick-actions__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-3.31 0-6 2.02-6 4.5V20h12v-1.5C18 16.02 15.31 14 12 14Z"
            fill="currentColor"
        />
    </svg>
);

const IconHeart = () => (
    <svg className="quick-actions__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M12.1 18.55 12 18.65l-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5 18.5 5 20 6.5 20 8.5c0 2.89-3.14 5.74-7.9 10.05Z"
            fill="currentColor"
        />
    </svg>
);

const IconArrowUp = () => (
    <svg className="quick-actions__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M12 5.5 6.5 11h3.75V18.5h3.5V11H17.5L12 5.5Z"
            fill="currentColor"
        />
    </svg>
);

const IconGlobe = () => (
    <svg className="quick-actions__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
            d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 1.5c1.05 0 2.02.27 2.87.75-.54.63-.97 1.46-1.3 2.39H10.4c-.33-.93-.76-1.76-1.3-2.39A6.46 6.46 0 0 1 12 5.5Zm-3.23 1A9.94 9.94 0 0 1 9.7 9.64H6.56A5.97 5.97 0 0 1 8.77 6.5Zm-2.8 5.1c0-.17 0-.33.02-.5h3.55c.05.47.08.96.08 1.45 0 .49-.03.98-.08 1.45H5.99a6.1 6.1 0 0 1-.02-.5c0-.65.08-1.27.23-1.9Zm.59 3.4H9.7c-.33.93-.76 1.76-1.3 2.39A5.97 5.97 0 0 1 6.56 14.9Zm3.84 0h3.2c-.37 1.08-.83 1.98-1.4 2.64-.57-.66-1.03-1.56-1.4-2.64Zm.29-2.45c0-.53-.03-1.04-.08-1.55h3.18c.05.51.08 1.02.08 1.55 0 .53-.03 1.04-.08 1.55h-3.18c-.05-.51-.08-1.02-.08-1.55Zm4.01 4.84c.54-.63.97-1.46 1.3-2.39h3.14a5.97 5.97 0 0 1-2.21 2.39Zm.92-4.34c.05-.47.08-.96.08-1.45 0-.49-.03-.98-.08-1.45h3.55c.04.31.06.63.06.95 0 .32-.02.64-.06.95Zm-.92-5.3a5.97 5.97 0 0 1 2.21 2.39H15.7c-.33-.93-.76-1.76-1.3-2.39ZM12 5.5Z"
            fill="currentColor"
        />
    </svg>
);

const QuickActions = () => {
    const [open, setOpen] = useState(false);

    const handleScrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={`quick-actions ${open ? 'quick-actions--open' : ''}`}>
            <button
                className="quick-actions__toggle"
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="퀵 액션 열기"
            >
                +
            </button>

            <div className="quick-actions__items">
                <a href="/account" className="quick-actions__item" aria-label="마이페이지">
                    <IconUser />
                </a>
                <a href="/favorites" className="quick-actions__item" aria-label="찜 내역">
                    <IconHeart />
                </a>
                <button
                    type="button"
                    className="quick-actions__item"
                    onClick={handleScrollTop}
                >
                    <IconArrowUp />
                </button>
                <a href="/search" className="quick-actions__item" aria-label="검색 결과 목록">
                    <IconGlobe />
                </a>
            </div>
        </div>
    );
};

export default QuickActions;


