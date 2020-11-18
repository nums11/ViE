echo "---------------- Running test with small seed_size ----------------"
npx cypress run --spec "cypress/integration/Actions/meeting_creation_spec.js"\
 -b chrome --headless --record --key 2be23156-7680-4fd8-bce1-e0c09f23c002\
 --group "small_seeds2" --ci-build-id local2 -e seed_size=small

echo "---------------- Running test with medium seed_size ----------------"
npx cypress run --spec "cypress/integration/Actions/meeting_creation_spec.js"\
 -b chrome --headless --record --key 2be23156-7680-4fd8-bce1-e0c09f23c002\
 --group "small_seeds2" --ci-build-id local2 -e seed_size=medium