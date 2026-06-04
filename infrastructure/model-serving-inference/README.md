# Model Serving & Inference

Patterns for deploying and serving ML models in production — covering batch vs real-time inference, serving platforms (vLLM, Triton, TGI), quantization, GPU optimization, and edge deployment.

## Decision Tree

```
Priority 1: IF inference_mode == batch
              THEN → batch_inference_pipeline

Priority 2: IF deployment_target == edge_cpu AND gpu_availability == false
              THEN → edge_optimized_inference

Priority 3: IF throughput_requirement in [high, very_high] AND model_size in [large, very_large]
              THEN → distributed_inference (tensor parallelism)

Priority 4: IF deployment_target == serverless
              THEN → serverless_inference

FALLBACK → standard_model_serving
```

## Key Patterns

| Pattern | Use Case |
|---------|----------|
| **Standard Model Serving** | Realtime inference with vLLM, Triton, or TGI on GPU |
| **Distributed Inference** | Large models with tensor parallelism across GPUs |
| **Batch Inference Pipeline** | Offline dataset processing optimized for throughput |
| **Edge Optimized Inference** | CPU/edge deployment with quantization and distillation |
| **Serverless Inference** | Variable traffic, pay-per-inference (SageMaker, Modal) |

## Context Inputs

- `inference_mode`: realtime / near_realtime / batch
- `model_size`: small / medium / large / very_large
- `throughput_requirement`: low / medium / high / very_high
- `latency_sla`: realtime / interactive / batch
- `gpu_availability`: boolean
- `deployment_target`: cloud_gpu / on_premises_gpu / edge_cpu / serverless

## Related Standards

- [containerization](../containerization/) — Model serving in containers
- [orchestration](../orchestration/) — K8s for model serving
- [cloud-architecture](../cloud-architecture/) — GPU instance selection

## Anti-Patterns

- GPU Underutilization
- No Cold Start Mitigation
- Deploying Unquantized Models to Edge
