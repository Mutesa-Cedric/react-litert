import { imagenetClasses } from '../utils/imagenetClasses';
import { Badge, Button, Flex, Heading, ProgressCircle, Text, View } from '@adobe/react-spectrum';
import * as tf from '@tensorflow/tfjs-core';
import { useState } from 'react';
import { useLiteRtTfjsModel } from 'react-litert';

interface Prediction {
  label: string;
  confidence: number;
}

export default function ImageClassifier() {
  const { status, run, error, accelerator } = useLiteRtTfjsModel({
    modelUrl: '/models/mobilenet_v2_1.0_224.tflite',
    id: 'mobilenet-v2',
  });

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);

  const preprocessImage = async (imageElement: HTMLImageElement): Promise<tf.Tensor4D> => {
    const tensor = tf.browser.fromPixels(imageElement);
    const resized = tf.image.resizeBilinear(tensor, [224, 224]);
    const normalized = tf.div(tf.sub(resized, 127.5), 127.5);
    const batched = tf.expandDims(normalized, 0) as tf.Tensor4D;

    tensor.dispose();
    resized.dispose();
    normalized.dispose();

    return batched;
  };

  const classifyImage = async (file: File) => {
    if (status !== 'ready' || !run) return;

    setIsClassifying(true);
    setPredictions([]);

    try {
      const imageUrl = URL.createObjectURL(file);
      setImageUrl(imageUrl);

      const img = new Image();
      img.src = imageUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const inputTensor = await preprocessImage(img);
      const output = await run(inputTensor);

      let outputTensor: tf.Tensor;
      if (Array.isArray(output)) {
        outputTensor = output[0];
      } else if (output && typeof output === 'object' && 'data' in output) {
        outputTensor = output as tf.Tensor;
      } else {
        throw new Error(`Unexpected output format: ${typeof output}`);
      }

      const logits = await outputTensor.data();

      const predictions: Prediction[] = Array.from(logits)
        .map((confidence, index) => ({
          label: imagenetClasses[index] || `Class ${index}`,
          confidence: confidence,
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      setPredictions(predictions);

      inputTensor.dispose();
      outputTensor.dispose();
    } catch (err) {
      console.error('Classification error:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      classifyImage(file);
    }
  };

  const handleClear = () => {
    setImageUrl(null);
    setPredictions([]);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  const isReady = status === 'ready';

  return (
    <View backgroundColor="static-white" borderRadius="medium">
      <Flex direction="column" gap="size-300">
        <View
          padding="size-300"
          UNSAFE_style={{
            borderBottom: '1px solid #e1e1e1',
          }}
        >
          <Flex gap="size-200" wrap>
            <Badge variant={status === 'ready' ? 'positive' : 'neutral'}>
              {status.toUpperCase()}
            </Badge>
            {accelerator && <Badge variant="info">{accelerator.toUpperCase()}</Badge>}
          </Flex>
        </View>

        <View padding="size-300">
          <Flex direction="column" gap="size-400">
            {error && (
              <View
                backgroundColor="negative"
                padding="size-300"
                borderRadius="medium"
                UNSAFE_style={{ border: '1px solid #d32f2f' }}
              >
                <Text>
                  <strong>Error:</strong> {error.message}
                </Text>
              </View>
            )}

            {!imageUrl && (
              <View
                borderRadius="medium"
                padding="size-800"
                UNSAFE_style={{
                  border: '2px dashed #d1d1d1',
                  backgroundColor: '#fafafa',
                  cursor: isReady ? 'pointer' : 'not-allowed',
                  transition: 'border-color 0.2s',
                }}
                UNSAFE_className="upload-zone"
              >
                <Flex direction="column" alignItems="center" gap="size-300">
                  <View
                    UNSAFE_style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      color: '#666',
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </View>
                  <Heading level={3} UNSAFE_style={{ margin: 0, fontWeight: 600 }}>
                    Upload Image
                  </Heading>
                  <Text UNSAFE_style={{ color: '#6e6e6e' }}>Click to select or drag and drop</Text>
                  <Button
                    variant="cta"
                    onPress={() => document.getElementById('file-input')?.click()}
                    isDisabled={!isReady}
                    UNSAFE_style={{ marginTop: '8px' }}
                  >
                    Select File
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    disabled={!isReady}
                  />
                </Flex>
              </View>
            )}

            {imageUrl && !isClassifying && predictions.length > 0 && (
              <Flex direction="column" gap="size-400">
                <Flex gap="size-400" wrap="wrap">
                  <View
                    flex="1"
                    minWidth="300px"
                    borderRadius="medium"
                    overflow="hidden"
                    UNSAFE_style={{
                      border: '1px solid #e1e1e1',
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt="Uploaded"
                      style={{
                        width: '100%',
                        display: 'block',
                        maxHeight: '500px',
                        objectFit: 'contain',
                        background: '#fafafa',
                      }}
                    />
                  </View>

                  <View
                    flex="1"
                    minWidth="300px"
                    backgroundColor="gray-100"
                    borderRadius="medium"
                    padding="size-300"
                  >
                    <Flex direction="column" gap="size-200">
                      <Heading
                        level={4}
                        UNSAFE_style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}
                      >
                        Results
                      </Heading>
                      {predictions.map((pred, idx) => (
                        <View
                          key={idx}
                          backgroundColor="static-white"
                          borderRadius="small"
                          padding="size-200"
                          UNSAFE_style={{
                            border: '1px solid #e1e1e1',
                          }}
                        >
                          <Flex direction="column" gap="size-100">
                            <Flex justifyContent="space-between" alignItems="center">
                              <Text UNSAFE_style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                {pred.label}
                              </Text>
                              <Text
                                UNSAFE_style={{
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  color: idx === 0 ? '#0d66d0' : '#6e6e6e',
                                }}
                              >
                                {(pred.confidence * 100).toFixed(1)}%
                              </Text>
                            </Flex>
                            <View
                              borderRadius="small"
                              UNSAFE_style={{
                                height: '4px',
                                background: '#e1e1e1',
                                overflow: 'hidden',
                              }}
                            >
                              <View
                                UNSAFE_style={{
                                  height: '100%',
                                  width: `${pred.confidence * 100}%`,
                                  background: idx === 0 ? '#0d66d0' : '#6e6e6e',
                                  transition: 'width 0.5s ease',
                                }}
                              />
                            </View>
                          </Flex>
                        </View>
                      ))}
                    </Flex>
                  </View>
                </Flex>

                <Button variant="secondary" onPress={handleClear} UNSAFE_style={{ width: '100%' }}>
                  Clear & Upload New Image
                </Button>
              </Flex>
            )}

            {isClassifying && (
              <View padding="size-800">
                <Flex direction="column" alignItems="center" gap="size-300">
                  <ProgressCircle aria-label="Classifying" isIndeterminate size="L" />
                  <Text UNSAFE_style={{ fontWeight: 500, color: '#6e6e6e' }}>
                    Analyzing image...
                  </Text>
                </Flex>
              </View>
            )}
          </Flex>
        </View>
      </Flex>

      <style>{`
        .upload-zone:hover {
          border-color: #0d66d0;
        }
      `}</style>
    </View>
  );
}
