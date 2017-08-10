module Decoder exposing (..)

import Json.Decode exposing (..)
import Json.Decode.Pipeline exposing (..)
import Types exposing (..)


releaseStatusDecoder : Decoder ReleaseStatus
releaseStatusDecoder =
    decode ReleaseStatus
        |> required "status" statusDecoder
        |> optional "message" (map Just string) Nothing


statusDecoder : Decoder Status
statusDecoder =
    string
        |> andThen
            (\value ->
                case value of
                    "missing" ->
                        succeed Missing

                    "incomplete" ->
                        succeed Incomplete

                    "exists" ->
                        succeed Exists

                    "error" ->
                        succeed <| Error "An error occured"

                    somethingElse ->
                        fail <| "Unknown status: " ++ somethingElse
            )


ongoingVersionsDecoder : Decoder OngoingVersions
ongoingVersionsDecoder =
    decode OngoingVersions
        |> required "esr" string
        |> required "release" string
        |> required "beta" string
        |> required "nightly" string
