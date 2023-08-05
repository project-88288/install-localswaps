mkdir ./contracts/terraswap_factory/artifacts/
cp ./artifacts/terraswap_factory.wasm ./contracts/terraswap_factory/artifacts/
terrain contract:store terraswap_factory --signer test --network localterra --no-rebuild \
--config-path ./config.terrain.json
