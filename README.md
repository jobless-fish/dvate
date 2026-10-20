# DVATE NAMSAN COFFEE — GitHub Pages

GitHub Pages 루트용 전체 소스입니다. index.html, style.css, app.js, assets/, .nojekyll을 기존 저장소 루트에 덮어쓰세요. .git 또는 기존 CNAME 파일은 지우지 마세요. 이 ZIP에는 .openai 호스팅 설정과 Git 인증정보가 없습니다.

수정 내용: 영상 화면 클릭·터치로 재생/일시정지, 기존 우측 아래 제어 유지, 중앙 로고를 실제 크기의 인라인 SVG로 렌더링, 상단 브랜드명 대문자. 기존 리뷰 관성 슬라이드와 콘텐츠도 포함합니다.

PowerShell 업데이트:

    cd "C:\Users\Playdata\Desktop\dvate_namsan_coffee\dist"
    git pull --rebase origin main

그다음 ZIP의 파일을 이 폴더에 덮어쓴 후:

    git add .
    git commit -m "Improve video controls and logo rendering"
    git push

GitHub Pages: main / (root). 별도 빌드 없음.

추가 변경: '커피가 되는 시간' 문구 삭제.


이번 수정: 리뷰 6개 → 18개(확인한 실제 후기 12개를 요약하여 추가). 평점·개수·발췌 확인 안내 제거. THANK YOU FOR VISIT 대문자. 방문 정보와 브랜드명 하단 정렬. 별도 배포하지 않음.
