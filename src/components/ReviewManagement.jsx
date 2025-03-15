import '../css/ReviewManagement.css';
import searchIcon from '../css/searchIcon.png';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [checkItems, setCheckItems] = useState([]); // 선택된 항목 ID 배열
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 13;

    const indexOfLastreview = currentPage * reviewsPerPage;
    const indexOfFirstreview = indexOfLastreview - reviewsPerPage;
    const currentreviews = reviews.slice(indexOfFirstreview, indexOfLastreview);

    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    useEffect(() => {
        axios
            .get('/api/review/info', {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
            })
            .then((response) => {
                setReviews(response.data);
            })
            .catch((error) => {
                console.error('Error fetching reviews:', error);
            });
    }, []);

    // 개별 체크박스 핸들러
    const checkItemHandler = (merchantUid, isChecked) => {
        if (isChecked) {
            setCheckItems((prev) => [...prev, merchantUid]); // 추가
            console.log(merchantUid);
        } else {
            setCheckItems((prev) => prev.filter((item) => item !== merchantUid)); // 제거
        }
    };

    // 전체 선택/해제 핸들러
    const allCheckedHandler = (isChecked) => {
        if (isChecked) {
            setCheckItems(currentreviews.map((review) => review.merchantUid)); // 현 페이지 모든 항목 선택
            console.log(checkItems);
        } else {
            setCheckItems((prev) =>
                prev.filter(
                    (item) =>
                        !currentreviews.map((review) => review.merchantUid).includes(item)
                )
            ); // 현 페이지 항목만 선택 해제
        }
    };

    const handleDeleteSelected = () => {
        const newReviews = reviews.filter(
            (review) => !checkItems.includes(review.merchantUid)
        );
        setReviews(newReviews);
        axios
            .put('/api/review/update', {
                deleteReview : checkItems
            }, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                }
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error('Error fetching reviews:', error);
            });
        setCheckItems([]);
    };

    return (
        <div className="review-management-page">
            <div className="review-management-title">리뷰 관리</div>
            <div className="review-management-search">
                <input type="search" className="review-search-input" />
                <img
                    className="review-search-input-image"
                    src={searchIcon}
                    alt="search"
                />
            </div>
            <div className="review-management-button">
                <button className="delete-button" onClick={handleDeleteSelected}>
                    삭제
                </button>
            </div>
            <table className="review-management-table">
                <thead className="review-management-thead">
                    <tr>
                        <th>
                            {/* 1번 체크박스 */}
                            <label className="custom-circle-checkbox">
                                <input
                                    type="checkbox"
                                    className="review-management-checkbox"
                                    onChange={(e) =>
                                        allCheckedHandler(e.target.checked)
                                    }
                                    checked={
                                        currentreviews.length > 0 &&
                                        currentreviews.every((review) =>
                                            checkItems.includes(review.merchantUid)
                                        )
                                    }
                                />
                                <span className="circle"></span>
                            </label>
                        </th>
                        <th className="review-management-thead-th">리뷰 번호</th>
                        <th className="review-management-thead-th">전시 번호</th>
                        <th className="review-management-thead-th">제목</th>
                        <th className="review-management-thead-th">작성자</th>
                        <th className="review-management-thead-th">작성일</th>
                    </tr>
                </thead>
                <tbody>
                    {currentreviews.map((review, index) => (
                        <tr key={index}>
                            <td className="review-management-input-checkbox">
                                {/* 2번 체크박스 */}
                                <label className="custom-circle-checkbox">
                                    <input
                                        type="checkbox"
                                        className="review-management-checkbox"
                                        onChange={(e) =>
                                            checkItemHandler(
                                                review.merchantUid,
                                                e.target.checked
                                            )
                                        }
                                        checked={checkItems.includes(
                                            review.merchantUid
                                        )}
                                    />
                                    <span className="circle"></span>
                                </label>
                            </td>
                            <td className="review-management-td">{review.merchantUid}</td>
                            <td className="review-management-td">{review.exhibitionNo}</td>
                            <td className="review-info">{review.exhibitionTitle}</td>
                            <td className="review-management-td">{review.name}</td>
                            <td className="review-management-td">{review.reviewDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <div className="pagination11">
                    <button
                        className="prev"
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                    >
                        ◀
                    </button>
                </div>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                        <button
                            key={page}
                            className={`pagination-button ${
                                page === currentPage ? 'active' : ''
                            }`}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>
                    )
                )}
                <div className="pagination12">
                    <button
                        className="next"
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                            )
                        }
                    >
                        ▶
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewManagement;
