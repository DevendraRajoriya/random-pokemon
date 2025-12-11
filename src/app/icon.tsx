import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 20,
          background: '#0F0F0F', // Cypherpunk Black
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F5BC22', // Marigold
          borderRadius: '0px', // Sharp edges (No rounded corners)
          border: '2px solid #F5BC22', // Marigold border
          fontWeight: 900,
          fontFamily: 'monospace',
        }}
      >
        ⚡
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}