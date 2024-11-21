import React from 'react';
import '../css/CommentManagement.css';
import searchIcon from '../css/searchIcon.png';
import axios from 'axios';
import { useState, useEffect } from 'react';

const CommentManagement = () => {
    
    const [comments, setComments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const commentsPerPage = 13;
    const [searchKeyword, setSearchKeyword] = useState(""); // 검색어 상태 추가

    useEffect(() => {
        fetchComments();
    }, []);

    // 댓글 목록을 불러오는 함수
    const fetchComments = async (keyword = "") => {
        try {
            const response = await axios.get('http://localhost:7777/api/parent/reply/select', {
                params: {
                    searchKeyword: keyword // 검색어 파라미터로 전달
                }
            });
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments", error);
            alert("댓글 목록을 가져오는 데 오류가 발생했습니다.");
        }
    };

    // 검색 이벤트 핸들러
    const handleSearch = () => {
        fetchComments(searchKeyword);
    };

    const [selectedcomments, setSelectedcomments] = useState({});

    const handleSelectcomment = (replyType, replyNo) => {
        const key = `${replyType}-${replyNo}`; // 부모는 "parent-번호", 자식은 "child-번호"
        const pageSelected = selectedcomments[currentPage] || new Set();

        if (pageSelected.has(key)) {
            pageSelected.delete(key); // 이미 선택된 경우 선택 해제
        } else {
            pageSelected.add(key); // 선택
        }

        setSelectedcomments({
            ...selectedcomments,
            [currentPage]: new Set(pageSelected),
        });
    };

    const handleSelectAll = () => {
        const pageSelected = selectedcomments[currentPage] || new Set();
        const currentCommentsKeys = currentComments.map(comment => {
            if (comment.childrenReplyNo === 0) {
                return `parent-${comment.parentReplyNo}`;
            } else {
                return `child-${comment.childrenReplyNo}`;
            }
        });

        if (pageSelected.size !== currentComments.length) {
            // 전체 선택
            currentCommentsKeys.forEach(key => pageSelected.add(key));
        } else {
            // 전체 선택 해제
            pageSelected.clear();
        }

        setSelectedcomments({
            ...selectedcomments,
            [currentPage]: new Set(pageSelected),
        });
    };

    const handleDeleteSelected = async () => {
        const pageSelected = selectedcomments[currentPage] || new Set();
        const parentReplyNos = [...pageSelected]
            .filter((key) => key.startsWith("parent-")) // 부모 댓글 필터링
            .map((key) => parseInt(key.split("-")[1], 10)); // 부모 댓글 번호 추출
    
        const childrenReplyNos = [...pageSelected]
            .filter((key) => key.startsWith("child-")) // 자식 댓글 필터링
            .map((key) => parseInt(key.split("-")[1], 10)); // 자식 댓글 번호 추출
    
        try {
            if (parentReplyNos.length > 0) {
                await axios.post("http://localhost:7777/api/parent/reply/delete", parentReplyNos, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            }
            if (childrenReplyNos.length > 0) {
                await axios.post("http://localhost:7777/api/children/reply/delete", childrenReplyNos, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            }
            alert("선택된 댓글이 삭제되었습니다.");
            fetchComments();
        } catch (error) {
            console.error("Error deleting comments:", error);
            alert("댓글 삭제 중 오류가 발생했습니다.");
        }
    };
    
    // 현재 페이지의 댓글 정보 계산
    const indexOfLastMember = currentPage * commentsPerPage;
    const indexOfFirstMember = indexOfLastMember - commentsPerPage;
    const currentComments = comments.slice(indexOfFirstMember, indexOfLastMember);

    // 페이지네이션 버튼 핸들러
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // 페이지가 변경될 때 선택된 댓글 초기화
        setSelectedcomments({});
    };

    const totalPages = Math.ceil(comments.length / commentsPerPage);

    //페이지 버튼 제한
    const getVisiblePages = (currentPage, totalPages) => {
        const visiblePages = [];
        const startPage = Math.max(1, Math.floor((currentPage - 1) / 10) * 10 + 1);
        const endPage = Math.min(startPage + 9, totalPages);
    
        for (let i = startPage; i <= endPage; i++) {
            visiblePages.push(i);
        }
    
        return visiblePages;
    };

    // 페이지네이션 버튼 클릭 시 다음 페이지 세트로 이동
    const handleNextSet = () => {
        const nextPageSet = Math.floor((currentPage - 1) / 10) + 1;
        const newPage = nextPageSet * 10 + 1;
        if (newPage <= totalPages) {
            setCurrentPage(newPage);
        } else {
            // 총 페이지 수를 넘지 않도록 총 페이지 수로 설정
            setCurrentPage(totalPages);
        }
    };

    // 페이지네이션 버튼 클릭 시 이전 페이지 세트로 이동
    const handlePrevSet = () => {
        const prevPageSet = Math.floor((currentPage - 1) / 10) - 1;
        const newPage = Math.max(prevPageSet * 10 + 1, 1);
        setCurrentPage(newPage);
    };

    return (
        <div className="comment-management-page">
            <div className="comment-management-title">댓글 관리</div>
            <div className='comment-management-search'>
                <input type="search" className="comment-search-input" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}></input>
                <img className="comment-search-input-image" src={searchIcon} onClick={handleSearch}></img>
            </div>
            <div className="comment-management-button">
                <button className="delete-button" onClick={handleDeleteSelected}>삭제</button>
            </div>
            <table className='comment-management-table'>
                <thead className="comment-management-thead">
                    <tr>
                        <th>
                            <label className="custom-circle-checkbox">
                                <input
                                    type="checkbox"
                                    className="comment-management-checkbox"
                                    onChange={handleSelectAll}
                                    checked={
                                        selectedcomments[currentPage]?.size === currentComments.length &&
                                        currentComments.length > 0
                                    }
                                />
                                <span className="circle"></span>
                            </label>
                        </th>
                        <th className="comment-management-thead-th">글 번호</th>
                        <th className="comment-management-thead-th">댓글 번호</th>
                        <th className="comment-management-thead-th">답글 번호</th>
                        <th className="comment-management-thead-th">내용</th>
                        <th className="comment-management-thead-th">작성자</th>
                        <th className="comment-management-thead-th">작성일</th>
                    </tr>
                </thead>
                <tbody>
                    {currentComments.map((comment) => (
                        <React.Fragment key={`parent-${comment.parentReplyNo}-${comment.childrenReplyNo}`}>
                            {/* 부모 댓글 렌더링 */}
                            {comment.childrenReplyNo === 0 ? (
                                <tr key={`parent-${comment.parentReplyNo}`}>
                                    <td className="comment-management-input-checkbox">
                                        <label className="custom-circle-checkbox">
                                            <input
                                                type="checkbox"
                                                className="comment-management-checkbox"
                                                checked={selectedcomments[currentPage]?.has(`parent-${comment.parentReplyNo}`) || false}
                                                onChange={() => handleSelectcomment("parent", comment.parentReplyNo)}
                                            />
                                            <span className="circle"></span>
                                        </label>
                                    </td>
                                    <td className="comment-management-td">{comment.postNo}</td>
                                    <td className="comment-management-td">{comment.parentReplyNo}</td>
                                    <td className="comment-management-td">{comment.childrenReplyNo}</td>
                                    <td className="comment-info">{comment.parentReplyContent}</td>
                                    <td className="comment-management-td">{comment.userId}</td>
                                    <td className="comment-management-td">{comment.parentReplyDatetime}</td>
                                </tr>
                            ) : (
                                <tr key={`child-${comment.childrenReplyNo}`}>
                                    <td className="comment-management-input-checkbox">
                                        <label className="custom-circle-checkbox">
                                            <input
                                                type="checkbox"
                                                className="comment-management-checkbox"
                                                checked={selectedcomments[currentPage]?.has(`child-${comment.childrenReplyNo}`) || false}
                                                onChange={() => handleSelectcomment("child", comment.childrenReplyNo)}
                                            />
                                            <span className="circle"></span>
                                        </label>
                                    </td>
                                    <td className="comment-management-td">{comment.postNo}</td>
                                    <td className="comment-management-td">{comment.parentReplyNo}</td>
                                    <td className="comment-management-td">{comment.childrenReplyNo}</td>
                                    <td className="comment-info">{comment.childrenReplyContent}</td>
                                    <td className="comment-management-td">{comment.userId}</td>
                                    <td className="comment-management-td">{comment.childrenReplyDatetime}</td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <div className="pagination11">
                    <button className="prev" onClick={handlePrevSet}>◀</button>
                </div>
                {getVisiblePages(currentPage, totalPages).map((page) => (
                    <div className="pagination1" key={page}>
                        <button
                            className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    </div>
                ))}
                <div className="pagination12">
                    <button className="next" onClick={handleNextSet}>▶</button>
                </div>
            </div>
        </div>
    );
};

export default CommentManagement;
