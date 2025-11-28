import { Flex, Heading, Text, View } from '@adobe/react-spectrum';
import { LiteRtProvider } from 'react-litert';
import ImageClassifier from './components/ImageClassifier';

function App() {
  return (
    <LiteRtProvider
      config={{
        wasmRoot: '/litert-wasm/',
        preferAccelerators: ['webgpu', 'wasm'],
        tfBackend: 'webgpu',
        autoShareWebGpuWithTfjs: true,
      }}
    >
      <View
        height="100vh"
        backgroundColor="gray-100"
        UNSAFE_style={{ overflow: 'auto' }}
      >
        <View padding="size-400">
          <Flex
            direction="column"
            gap="size-300"
            maxWidth="1200px"
            margin="0 auto"
          >
            <View
              backgroundColor="static-white"
              borderRadius="medium"
              padding="size-300"
            >
              <Heading level={1} UNSAFE_style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
                Image Classification
              </Heading>
              <Text UNSAFE_style={{ fontSize: '0.875rem', color: '#6e6e6e', marginTop: '4px' }}>
                MobileNet V2 inference powered by <b>react-litert</b>
              </Text>
            </View>
            <ImageClassifier />
          </Flex>
        </View>
      </View>
    </LiteRtProvider>
  );
}

export default App;
