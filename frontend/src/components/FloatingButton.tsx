export const FloatingButton = ({
  text,
  onClick,
}: {
  text: string
  onClick: () => void
}) => {
  return (
    <>
      {/* 그라데이션 오버레이 */}
      <div
        style={{
          position: 'fixed',
          bottom: '0px',
          left: '0px',
          right: '0px',
          height: '120px', // FloatingButton 높이 + 여유분
          background:
            'linear-gradient(to top, var(--background) 40%, transparent 100%)',
          pointerEvents: 'none', // 클릭 이벤트 방해하지 않음
          zIndex: 999,
        }}
      />
      <button
        style={{
          position: 'fixed',
          bottom: '30px',
          left: '0px',
          right: '0px',
          margin: '0 auto',
          width: '300px',
          height: '60px',
          borderRadius: '30px',
          backgroundColor: 'color-mix(in srgb, var(--green) 20%, white)',
          color: 'var(--main-text)',
          border: 'none',
          fontSize: '30px',
          cursor: 'pointer',
          boxShadow: '0px 0px 40px 5px var(--hovered-item)',
          zIndex: 1000,
        }}
        onClick={onClick}
      >
        <span
          style={{ fontSize: '18px', fontWeight: 'bold', display: 'block' }}
        >
          {text}
        </span>
      </button>
    </>
  )
}
